require("dotenv").config();
const { Client, PrivateKey, AccountId, TransferTransaction } = require("@hashgraph/sdk");

const myAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const myPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
const recipientId = AccountId.fromString(process.env.RECIPIENT_ACCOUNT_ID);

// Initialize Hedera client
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);

// Function to transfer HBAR
async function transferHbar(amount) {
    try {
        const transaction = new TransferTransaction()
            .addHbarTransfer(myAccountId, -amount) // Send HBAR
            .addHbarTransfer(recipientId, amount); // Receive HBAR

        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);

        return {
            status: receipt.status.toString(),
            transactionId: txResponse.transactionId.toString(),
        };
    } catch (error) {
        console.error("Transaction failed:", error);
        return { error: error.message };
    }
}

const { AccountBalanceQuery, TransactionRecordQuery } = require("@hashgraph/sdk");

async function getTransactionHistory() {
    try {
        const query = new TransactionRecordQuery()
            .setAccountId(myAccountId)
            .setMaxQueryPayment(new Hbar(1));

        const records = await query.execute(client);
        return records.map((record) => ({
            transactionId: record.transactionId.toString(),
            amount: record.transfers[0]?.amount.toTinybars() / 100_000_000 || 0,
            timestamp: record.consensusTimestamp.toDate().toLocaleString(),
        }));
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return [];
    }
}

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
        console.error("Conversion failed:", error);
        return { error: error.message };
    }
}

module.exports = { transferHbar, getBalance, getTransactionHistory, convertHbarToToken };
