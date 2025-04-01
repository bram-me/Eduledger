import React, { useState, useEffect } from "react";
import { Client, AccountBalanceQuery, TransferTransaction, Hbar } from "@hashgraph/sdk";
import VerifyTransaction from "./VerifyTransaction";  // Import VerifyTransaction
import TransactionHistory from "./TransactionHistory"; // Import TransactionHistory

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  useEffect(() => {
    fetchBalance();
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
      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, new Hbar(-1)) // Deduct 1 HBAR
        .addHbarTransfer("0.0.123456", new Hbar(1)) // Replace with recipient ID
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      alert("Transaction Successful! Status: " + receipt.status.toString());
      fetchBalance();
    } catch (error) {
      console.error("Transaction error:", error);
      alert("Transaction failed!");
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

      {/* Verify Transaction Component */}
      <VerifyTransaction />

      {/* Transaction History Component */}
      <TransactionHistory />
    </div>
  );
};

export default Wallet;
