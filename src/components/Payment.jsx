import React, { useState, useCallback } from "react";
import { Client, PrivateKey, TransferTransaction, TransactionId, Hbar } from "@hashgraph/sdk";
import { jsPDF } from "jspdf";
import "./Payment.css";

const Payment = () => {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");  // Added student name
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false); // State to track payment completion

  const hexPrivateKey = import.meta.env.VITE_HEDERA_PRIVATE_KEY.replace(/^0x/, "");
  const privateKey = PrivateKey.fromStringED25519(hexPrivateKey);
  const operatorId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;

  const client = Client.forTestnet();
  client.setOperator(operatorId, privateKey);

  // Payment Process function with validation
  const handlePaymentProcess = useCallback(async () => {
    if (!studentId || !amount || !transactionId) {
      setError("Missing payment details. Please scan the QR again.");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const amountInTinybars = Hbar.from(amount); // Using the Hbar object to convert the amount

      const transferTransaction = await new TransferTransaction()
        .addHbarTransfer(operatorId, amountInTinybars.negated()) // Transfer from operator account
        .addHbarTransfer(transactionId, amountInTinybars) // Transfer to the student's account
        .setTransactionMemo(`Payment for student ${studentId}`);

      const signedTransaction = await transferTransaction.sign(privateKey);

      const txResponse = await signedTransaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      setTransactionId(receipt.transactionId.toString());
      setStatus(receipt.status.toString());
      setPaymentCompleted(true); // Mark payment as completed
      alert(`Transaction Status: ${receipt.status}`);
    } catch (err) {
      setError("Payment processing failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId, amount, transactionId]);

  const handleScan = useCallback((data) => {
    console.log("Scanned Data:", data);
    setScannedData(data);
    setTransactionId(data?.transactionId || "");
  }, []);

  const checkTransactionStatus = async (txId) => {
    setLoading(true);
    try {
      const txReceipt = await new TransactionId(txId).getReceipt(client);
      const status = txReceipt.status.toString();
      setStatus(status);
      alert(`Transaction Status: ${status}`);
    } catch (error) {
      setError("Error fetching transaction status. Please try again.");
    }
    setLoading(false);
  };

  // Receipt Download with student name
  const ReceiptDownload = ({ transactionId, studentName, studentId, amount }) => {
    const handleDownload = () => {
      const doc = new jsPDF();
      doc.text(`Receipt for Payment`, 10, 10);
      doc.text(`Student Name: ${studentName}`, 10, 20);
      doc.text(`Student ID: ${studentId}`, 10, 30);
      doc.text(`Amount: ${amount} HBAR`, 10, 40);
      doc.text(`Transaction ID: ${transactionId}`, 10, 50);
      doc.save(`receipt_${transactionId}.pdf`);
    };

    return <button className="receipt-download-btn" onClick={handleDownload}>Download Receipt</button>;
  };

  // Simplified QR Payment and QR Code Scanner Components
  const QrPayment = ({ studentId, amount }) => {
    return (
      <div className="qr-payment">
        <h3>QR Code for Payment</h3>
        <p>Student ID: {studentId}</p>
        <p>Amount: {amount} HBAR</p>
        {/* Render QR code here */}
      </div>
    );
  };

  const QrCodeScanner = ({ onScan }) => {
    const handleScan = () => {
      const scannedData = { transactionId: "0.0.123456" }; // Simulated scan
      onScan(scannedData);
    };

    return <button onClick={handleScan}>Simulate QR Scan</button>;
  };

  const PaymentStatus = ({ transactionId }) => (
    <div className="payment-status">
      <h3>Transaction Status</h3>
      {transactionId ? (
        <p>Status for Transaction {transactionId}: {status}</p>
      ) : (
        <p>No transaction initiated yet.</p>
      )}
    </div>
  );

  const Receipt = ({ studentName, studentId, amount, transactionId }) => (
    <div className="receipt">
      <h3>Receipt</h3>
      <p>Student Name: {studentName}</p>
      <p>Student ID: {studentId}</p>
      <p>Amount: {amount} HBAR</p>
      <p>Transaction ID: {transactionId}</p>
    </div>
  );

  return (
    <div className="payment-page">
      <h1>Payment Section</h1>

      <div className="form-container">
        <input
          type="text"
          placeholder="Student Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (in HBAR)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="qr-section">
        <QrPayment studentId={studentId} amount={amount} />
        <QrCodeScanner onScan={handleScan} />
      </div>

      {error && <p className="error-message">{error}</p>}

      {status && <p className="status-message">Transaction Status: {status}</p>}
      <PaymentStatus transactionId={transactionId} />

      {/* Only show the receipt after the payment is completed */}
      {paymentCompleted && (
        <>
          <Receipt
            studentName={studentName}
            studentId={studentId}
            amount={amount}
            transactionId={transactionId}
          />
          <ReceiptDownload
            studentName={studentName}
            studentId={studentId}
            amount={amount}
            transactionId={transactionId}
          />
        </>
      )}

      {scannedData && (
        <button onClick={handlePaymentProcess} className="pay-btn" disabled={loading}>
          {loading ? "Processing..." : "Complete Payment"}
        </button>
      )}

      {transactionId && (
        <button onClick={() => checkTransactionStatus(transactionId)} className="check-btn">
          Check Transaction Status
        </button>
      )}
    </div>
  );
};

export default Payment;
