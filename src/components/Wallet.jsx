import React, { useState, useEffect } from "react";
import { Client, PrivateKey, AccountBalanceQuery, TransferTransaction, Hbar, TransactionId } from "@hashgraph/sdk";
import { FaCheck, FaTimes, FaSpinner } from "react-icons/fa";
import "./Wallet.css";  // Assuming you've added CSS styles for the wallet

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [transactionId, setTransactionId] = useState(null);

  const accountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
  const hexPrivateKey = import.meta.env.VITE_HEDERA_PRIVATE_KEY.replace(/^0x/, "");
  const privateKey = PrivateKey.fromStringED25519(hexPrivateKey);

  useEffect(() => {
    fetchBalance();
    fetchTransactionHistory();
  }, []);

  const fetchBalance = async () => {
    if (!accountId || !privateKey) {
      alert("Hedera credentials missing!");
      return;
    }
    setLoading(true);

    const client = Client.forTestnet().setOperator(accountId, privateKey);
    const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);

    try {
      const response = await balanceQuery.execute(client);
      setBalance(response.hbars.toString());
    } catch (error) {
      console.error("Balance fetch error:", error);
    }
    setLoading(false);
  };

  const sendPayment = async () => {
    if (!accountId || !privateKey) {
      alert("Hedera credentials missing!");
      return;
    }
    setLoading(true);
  
    const client = Client.forTestnet().setOperator(accountId, privateKey);
  
    try {
      // Create the transaction with the specified fee
      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, new Hbar(-1)) // Deduct 1 HBAR from sender
        .addHbarTransfer("0.0.123456", new Hbar(1)) // Send 1 HBAR to recipient
        .setTransactionMemo("Voting Transaction") // Add a memo (optional)
        .execute(client);
  
      // Get the receipt after transaction execution
      const receipt = await transaction.getReceipt(client);
  
      // Check the status of the transaction receipt
      if (receipt.status.toString() === "SUCCESS") {
        alert("Transaction Successful! Status: " + receipt.status.toString());
        fetchBalance(); // Refresh balance after successful transaction
      } else {
        // If the status is not SUCCESS, log the failure
        console.error("Transaction failed with status: " + receipt.status.toString());
        alert("Transaction failed with status: " + receipt.status.toString());
      }
  
    } catch (error) {
      // Log the error to help with debugging
      console.error("Transaction error:", error);
      alert("Transaction failed! Error: " + error.message);
    }
    setLoading(false);
  };
  

  const fetchTransactionHistory = async () => {
    // Example: Simulate fetching transaction history from Hedera
    setTransactions([
      { txId: "0.0.123456", status: "Success", amount: 1 },
      { txId: "0.0.654321", status: "Pending", amount: 2 }
    ]);
  };

  const verifyTransaction = async (txId) => {
    setLoading(true);

    const client = Client.forTestnet().setOperator(accountId, privateKey);

    try {
      const txReceipt = await new TransactionId(txId).getReceipt(client);
      const status = txReceipt.status.toString();
      setTransactionStatus(`Transaction ID: ${txId} Status: ${status}`);
    } catch (error) {
      setTransactionStatus(`Transaction ID: ${txId} Status: Failed to fetch.`);
    }

    setLoading(false);
  };

  return (
    <div className="wallet-container">
      <h2>EduLedger Wallet</h2>
      <div className="wallet-balance">
        <h3>Balance: {loading ? "Loading..." : `${balance} HBAR`}</h3>
        <button onClick={fetchBalance} disabled={loading}>Refresh Balance</button>
        <button onClick={sendPayment} disabled={loading}>Send 1 HBAR</button>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <h4>Transaction History</h4>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((transaction, index) => (
              <li key={index}>
                <p>Transaction ID: {transaction.txId}</p>
                <p>Status: {transaction.status}</p>
                <p>Amount: {transaction.amount} HBAR</p>
                <button onClick={() => verifyTransaction(transaction.txId)} disabled={loading}>
                  Verify Transaction
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions found.</p>
        )}
      </div>

      {/* Transaction Status */}
      {transactionStatus && (
        <div className="transaction-status">
          <h4>Transaction Status</h4>
          <p>{transactionStatus}</p>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && <FaSpinner className="spinner" />}
    </div>
  );
};

export default Wallet;
