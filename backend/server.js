require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
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

const SECRET_KEY = process.env.JWT_SECRET || 'supersecret';

// Initialize SQLite Database
const db = new sqlite3.Database('./eduledger.db', (err) => {
    if (err) console.error('Error connecting to database:', err.message);
    else console.log('Connected to SQLite database.');
});

// Create necessary tables if they do not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        account_id TEXT UNIQUE NOT NULL,
        private_key TEXT NOT NULL,
        balance INTEGER DEFAULT 1000000,  -- Stored in tinybars
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_id TEXT UNIQUE NOT NULL,
        from_account TEXT NOT NULL,
        to_account TEXT NOT NULL,
        amount INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

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

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
        if (row) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", 
            [username, hashedPassword], 
            function (err) {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ message: 'User registered successfully' });
            }
        );
    });
});

/**
 * User Login
 */
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = generateToken(username);
        res.json({ token });
    });
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

        db.run("INSERT INTO accounts (user_id, account_id, private_key) VALUES ((SELECT id FROM users WHERE username = ?), ?, ?)",
            [req.user.username, newAccountId.toString(), newPrivateKey.toStringRaw()],
            (err) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ accountId: newAccountId.toString(), privateKey: newPrivateKey.toStringRaw() });
            }
        );
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
        db.get("SELECT balance FROM accounts WHERE account_id = ?", [accountId], (err, row) => {
            if (!row) return res.status(404).json({ error: 'Account not found' });
            res.json({ balance: row.balance });
        });
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
        const transactionId = response.transactionId.toString();

        db.run("INSERT INTO transactions (transaction_id, from_account, to_account, amount) VALUES (?, ?, ?, ?)", 
            [transactionId, fromAccountId, toAccountId, amount]
        );

        res.json({ status: receipt.status.toString(), transactionId });
    } catch (error) {
        res.status(500).json({ error: 'Transaction failed' });
    }
});


const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');

app.get('/download-receipt/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    // Fetch transaction details
    db.query('SELECT * FROM payments WHERE transaction_id = ?', [transactionId], async (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Transaction not found' });

        const { student_id, amount, status, timestamp } = results[0];

        // Fetch student details
        db.query('SELECT * FROM students WHERE id = ?', [student_id], async (err, studentResults) => {
            if (err || studentResults.length === 0) return res.status(404).json({ error: 'Student not found' });

            const { school } = studentResults[0];

            // Generate PDF
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([500, 600]);

            const { width, height } = page.getSize();
            const fontSize = 20;

            page.drawText('ElimuLedger Payment Receipt', { x: 50, y: height - 50, size: fontSize, color: rgb(0, 0, 0) });
            page.drawText(`Transaction ID: ${transactionId}`, { x: 50, y: height - 100, size: 14 });
            page.drawText(`Student ID: ${student_id}`, { x: 50, y: height - 130, size: 14 });
            page.drawText(`School: ${school}`, { x: 50, y: height - 160, size: 14 });
            page.drawText(`Amount: ${amount} HBAR`, { x: 50, y: height - 190, size: 14 });
            page.drawText(`Status: ${status}`, { x: 50, y: height - 220, size: 14 });
            page.drawText(`Timestamp: ${timestamp}`, { x: 50, y: height - 250, size: 14 });

            const pdfBytes = await pdfDoc.save();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="receipt_${transactionId}.pdf"`);
            res.send(pdfBytes);
        });
    });
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
