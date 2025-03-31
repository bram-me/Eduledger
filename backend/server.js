require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
    Client, PrivateKey, AccountCreateTransaction, 
    AccountBalanceQuery, TransferTransaction, Hbar 
} = require('@hashgraph/sdk');
const pdf = require('pdfkit');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const users = {}; // Temporary user storage (Use DB in production)
const SECRET_KEY = process.env.JWT_SECRET || 'supersecret';

// Initialize Hedera Testnet Client
const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, PrivateKey.fromString(process.env.MY_PRIVATE_KEY));

/**
 * Generate JWT Token
 */
const generateToken = (username) => {
    return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
};

/**
 * User Registration
 */
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (users[username]) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { password: hashedPassword };
    res.json({ message: 'User registered successfully' });
});

/**
 * User Login
 */
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(username);
    res.json({ token });
});

/**
 * Middleware to Authenticate API Requests
 */
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

/**
 * Create a Hedera Account
 */
app.post('/create-account', authenticateToken, async (req, res) => {
    try {
        const newPrivateKey = PrivateKey.generate();
        const newPublicKey = newPrivateKey.publicKey;

        const transaction = new AccountCreateTransaction()
            .setKey(newPublicKey)
            .setInitialBalance(new Hbar(10));

        const response = await transaction.execute(client);
        const receipt = await response.getReceipt(client);
        const newAccountId = receipt.accountId;

        res.json({ 
            accountId: newAccountId.toString(), 
            privateKey: newPrivateKey.toStringRaw() 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error creating Hedera account' });
    }
});

/**
 * Fetch Account Balance
 */
app.get('/balance/:accountId', authenticateToken, async (req, res) => {
    try {
        const { accountId } = req.params;
        const balance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
        res.json({ balance: balance.hbars.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching balance' });
    }
});

/**
 * Transfer Hbars (Testnet)
 */
app.post('/transfer', authenticateToken, async (req, res) => {
    try {
        const { fromAccountId, toAccountId, amount, privateKey } = req.body;

        const senderKey = PrivateKey.fromString(privateKey);
        client.setOperator(fromAccountId, senderKey);

        const transaction = new TransferTransaction()
            .addHbarTransfer(fromAccountId, Hbar.fromTinybars(-amount))
            .addHbarTransfer(toAccountId, Hbar.fromTinybars(amount));

        const response = await transaction.execute(client);
        const receipt = await response.getReceipt(client);

        res.json({ 
            status: receipt.status.toString(), 
            transactionId: response.transactionId.toString() 
        });
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed' });
    }
});

/**
 * Generate PDF Receipt for Transaction
 */
app.post('/generate-receipt', authenticateToken, (req, res) => {
    const { transactionId, fromAccountId, toAccountId, amount } = req.body;

    const doc = new pdf();
    const filename = `receipt_${transactionId}.pdf`;
    const path = `./receipts/${filename}`;
    if (!fs.existsSync('./receipts')) fs.mkdirSync('./receipts');

    doc.pipe(fs.createWriteStream(path));

    doc.fontSize(20).text('EduLedger Payment Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Transaction ID: ${transactionId}`);
    doc.text(`From: ${fromAccountId}`);
    doc.text(`To: ${toAccountId}`);
    doc.text(`Amount: ${amount} tinybars`);
    doc.moveDown();
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.end();

    res.json({ message: 'Receipt generated', url: `/receipts/${filename}` });
});

/**
 * Serve Generated Receipts
 */
app.use('/receipts', express.static('receipts'));

app.listen(PORT, () => console.log(`EduLedger server running on port ${PORT}`));
