require("dotenv").config();
const { 
    Client, PrivateKey, AccountId, TransferTransaction, AccountBalanceQuery, 
    TransactionRecordQuery, Hbar
} = require("@hashgraph/sdk");

// Load environment variables
const myAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
const recipientId = AccountId.fromString(process.env.RECIPIENT_ACCOUNT_ID);

// Initialize Hedera client
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

// Transfer HBAR function
async function transferHbar(amount) {
    try {
        const transaction = new TransferTransaction()
            .addHbarTransfer(myAccountId, Hbar.fromTinybars(-amount * 100_000_000))
            .addHbarTransfer(recipientId, Hbar.fromTinybars(amount * 100_000_000));
        
        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        return { status: receipt.status.toString(), transactionId: txResponse.transactionId.toString() };
    } catch (error) {
        console.error("HBAR Transfer Failed:", error);
        return { error: error.message };
    }
}

// Get account balance
async function getBalance() {
    try {
        const balanceQuery = new AccountBalanceQuery().setAccountId(myAccountId);
        const balance = await balanceQuery.execute(client);
        return { hbar: balance.hbars.toString(), tokens: balance.tokens.toString() };
    } catch (error) {
        console.error("Balance Fetch Failed:", error);
        return { error: error.message };
    }
}

// Fetch transaction history
async function getTransactionHistory() {
    try {
        const query = new TransactionRecordQuery()
            .setAccountId(myAccountId)
            .setMaxQueryPayment(new Hbar(1));
        
        const records = await query.execute(client);
        return records.map(record => ({
            transactionId: record.transactionId.toString(),
            amount: record.transfers[0]?.amount.toTinybars() / 100_000_000 || 0,
            timestamp: record.consensusTimestamp.toDate().toLocaleString(),
        }));
    } catch (error) {
        console.error("Transaction History Fetch Failed:", error);
        return [];
    }
}

// Convert HBAR to token function
async function convertHbarToToken(tokenId, amount) {
    try {
        const transaction = new TransferTransaction()
            .addHbarTransfer(myAccountId, Hbar.fromTinybars(-amount * 100_000_000))
            .addTokenTransfer(tokenId, myAccountId, -amount)
            .addTokenTransfer(tokenId, recipientId, amount);

        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        return { status: receipt.status.toString(), transactionId: txResponse.transactionId.toString() };
    } catch (error) {
        console.error("Token Conversion Failed:", error);
        return { error: error.message };
    }
}

module.exports = { transferHbar, getBalance, getTransactionHistory, convertHbarToToken };
