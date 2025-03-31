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

module.exports = { transferHbar };
