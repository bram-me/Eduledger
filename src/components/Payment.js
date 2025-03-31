import React, { useState } from "react";
import { TransferTransaction, Client } from "@hashgraph/sdk";

const Payment = ({ accountId }) => {
  const [amount, setAmount] = useState("");
  const [transactionStatus, setTransactionStatus] = useState(null);

  const handlePayment = async () => {
    if (!accountId || !amount) return alert("Please enter an amount and connect wallet!");

    try {
      const client = Client.forTestnet().setOperator(accountId, process.env.HEDERA_PRIVATE_KEY);

      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, -amount)
        .addHbarTransfer(process.env.SCHOOL_ACCOUNT_ID, amount)
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      setTransactionStatus(receipt.status.toString());

      alert("Payment Successful!");
    } catch (error) {
      console.error(error);
      setTransactionStatus("Failed");
    }
  };

  return (
    <div className="payment-container">
      <h2>Pay School Fees</h2>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter HBAR amount" />
      <button onClick={handlePayment}>Pay Now</button>
      {transactionStatus && <p>Status: {transactionStatus}</p>}
    </div>
  );
};

export default Payment;
