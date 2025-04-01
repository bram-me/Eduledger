import { useState } from "react";
import QRCodePayment from "../components/QrPayment";
import QRCodeScanner from "../components/QrCodeScanner";
import Receipt from "../components/Receipt";

const Payment = () => {
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    setScannedData(data);
    setError(null); // Clear previous errors
  };

  const processPayment = async () => {
    if (!amount || !studentId || isNaN(amount)) {
      setError("Please enter a valid student ID and amount.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/hedera-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scannedData),
      });

      const result = await response.json();

      if (result.transactionId) {
        setReceiptData({
          studentId: scannedData.studentId,
          amount: scannedData.amount,
          transactionId: result.transactionId,
        });
      } else {
        setError("Payment failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while processing the payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-component">
      <h1>EduLedger Payments</h1>
      
      {/* QR Code Section */}
      <div className="qr-section">
        <QRCodePayment studentId={studentId} amount={amount} />
        <QRCodeScanner onScan={handleScan} />
      </div>

      {/* Displaying error message */}
      {error && <p className="error-message">{error}</p>}

      {/* Payment Button */}
      {scannedData && !receiptData && !loading && (
        <button onClick={processPayment} className="pay-btn">
          Complete Payment
        </button>
      )}

      {/* Loading Spinner */}
      {loading && <p>Processing payment...</p>}

      {/* Display Receipt */}
      {receiptData && <Receipt {...receiptData} />}
    </div>
  );
};

export default Payment;
