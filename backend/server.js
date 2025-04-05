const dotenv = require("dotenv");
dotenv.config();

console.log("🔹 HEDERA_PRIVATE_KEY:", process.env.HEDERA_PRIVATE_KEY);
const { PrivateKey, Client, AccountCreateTransaction, 
    AccountBalanceQuery, TransferTransaction, Hbar, FileCreateTransaction 
} = require('@hashgraph/sdk');

const hederaPrivateKey = process.env.HEDERA_PRIVATE_KEY?.trim();

if (!hederaPrivateKey) {
    console.error("❌ HEDERA_PRIVATE_KEY is missing or invalid!");
    process.exit(1);
}

console.log("✅ Using HEDERA_PRIVATE_KEY:", hederaPrivateKey);

try {
    const privateKey = PrivateKey.fromString(hederaPrivateKey);
    console.log("✅ Private Key loaded successfully!");
} catch (error) {
    console.error("❌ Error parsing Private Key:", error.message);
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const pdf = require('pdfkit');
const fs = require('fs');
const WebSocket = require("ws");
const PDFDocument = require('pdf-lib').PDFDocument;
const { rgb } = require('pdf-lib');
const QRCode = require('qrcode');

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

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

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

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

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
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Handling Bearer token
    if (!token) return res.status(403).json({ error: 'Access denied' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

/**
 * API to handle payment transactions via Hedera
 */
app.post('/hedera-payment', async (req, res) => {
    const { student_id, amount } = req.body;

    if (!student_id || !amount) {
        return res.status(400).json({ error: 'Student ID and amount are required' });
    }

    try {
        const tinybarAmount = amount * 100000000; // Convert HBAR to tinybars

        // Create transaction
        const transaction = new TransferTransaction()
            .addHbarTransfer(process.env.HEDERA_OPERATOR_ID, -tinybarAmount)  // Debit sender
            .addHbarTransfer(student_id, tinybarAmount);  // Credit student account

        // Sign & execute transaction
        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);

        if (receipt.status.toString() === "SUCCESS") {
            // Save payment record in database
            const sql = "INSERT INTO payments (student_id, amount, transaction_id, status) VALUES (?, ?, ?, ?)";
            db.run(sql, [student_id, amount, txResponse.transactionId.toString(), "completed"], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Payment successful", transactionId: txResponse.transactionId.toString() });
            });
        } else {
            res.status(400).json({ error: "Payment failed", status: receipt.status.toString() });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * WebSocket for live payment updates
 */
const wss = new WebSocket.Server({ noServer: true });

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Here you could add logic for sending live payment updates via WebSocket
});

/**
 * Hedera Account Creation Endpoint
 */
app.post('/create-account', authenticateToken, async (req, res) => {
    try {
        const newPrivateKey = PrivateKey.generate();
        const newPublicKey = newPrivateKey.publicKey;

        const transaction = new AccountCreateTransaction()
            .setKey(newPublicKey)
            .setInitialBalance(new Hbar(10)); // Initial balance in HBAR

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

// PDF Upload to Hedera File Service
async function uploadToHedera(filePath) {
    const fileData = fs.readFileSync(filePath);
    
    const fileTx = new FileCreateTransaction()
        .setContents(fileData)
        .setKeys([client.operatorPublicKey])
        .setMaxTransactionFee(200000000) // Max fee 2 HBAR
        .freezeWith(client);

    const fileSign = await fileTx.sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
    const fileSubmit = await fileSign.execute(client);
    const fileReceipt = await fileSubmit.getReceipt(client);
    
    return fileReceipt.fileId.toString();
}

// API Endpoint to Upload Receipt
app.post("/upload-receipt", async (req, res) => {
    try {
        const { filePath } = req.body;
        const fileId = await uploadToHedera(filePath);

        res.json({ message: "File uploaded to Hedera", fileId });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

/**
 * Generate PDF Receipt for Transaction
 */
app.get('/download-receipt/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    db.get('SELECT * FROM transactions WHERE transaction_id = ?', [transactionId], async (err, results) => {
        if (err || !results) return res.status(404).json({ error: 'Transaction not found' });

        const { from_account, to_account, amount } = results;
        
        // Generate a QR code linking to a verification page
        const qrData = `https://elimuledger.com/verify/${transactionId}`;
        const qrCode = await QRCode.toDataURL(qrData);

        
        // Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([500, 700]);
        const { width, height } = page.getSize();
        const fontSize = 18;

        page.drawText('EduLedger Payment Receipt', { x: 50, y: height - 50, size: fontSize, color: rgb(0, 0, 0) });
        page.drawText(`Transaction ID: ${transactionId}`, { x: 50, y: height - 100, size: 14 });
        page.drawText(`From: ${from_account}`, { x: 50, y: height - 130, size: 14 });
        page.drawText(`To: ${to_account}`, { x: 50, y: height - 160, size: 14 });
        page.drawText(`Amount: ${amount} tinybars`, { x: 50, y: height - 190, size: 14 });

        // Embed QR Code Image in PDF
        const qrImageBytes = Buffer.from(qrCode.split(",")[1], "base64");
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        page.drawImage(qrImage, { x: 50, y: height - 300, width: 150, height: 150 });

        page.drawText('Scan to verify transaction', { x: 50, y: height - 320, size: 12 });

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${transactionId}.pdf"`);
        res.send(pdfBytes);
    });
});

/**
 * Generate PDF Receipt for Transaction (Alternative Route)
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

/**
 * Transaction Verification API
 */
app.get('/api/verify/:transactionId', (req, res) => {
    const { transactionId } = req.params;

    db.get('SELECT * FROM transactions WHERE transaction_id = ?', [transactionId], (err, results) => {
        if (err || !results) return res.status(404).json({ error: 'Transaction not found' });
        res.json(results);
    });
});

const { FileContentsQuery } = require("@hashgraph/sdk");
const path = require("path");

// Retrieve File from Hedera HFS
async function fetchFromHedera(fileId) {
    try {
        const fileQuery = new FileContentsQuery().setFileId(fileId);
        const fileData = await fileQuery.execute(client);
        
        // Save it locally as a PDF
        const filePath = path.join(__dirname, `receipts/receipt_${fileId}.pdf`);
        fs.writeFileSync(filePath, fileData);

        return filePath;
    } catch (error) {
        throw new Error("Failed to fetch file from Hedera: " + error.message);
    }
}

// API Endpoint to Download Receipt
app.get("/download-receipt/:fileId", async (req, res) => {
    try {
        const { fileId } = req.params;
        const filePath = await fetchFromHedera(fileId);
        
        res.download(filePath); // Send the file for download
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.listen(PORT, () => console.log(`EduLedger server running on port ${PORT}`));
