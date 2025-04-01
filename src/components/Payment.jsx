import React, { useState } from "react";
import PaymentStatus from "./PaymentStatus";
import Receipt from "./Receipt";
import QrPayment from "./QrPayment";
import QrCodeScanner from "./QrCodeScanner";
import ReceiptDownload from "./ReceiptDownload";
import './Payment.css';

const Payment = () => {
    const [studentId, setStudentId] = useState("");
    const [amount, setAmount] = useState("");
    const [transactionId, setTransactionId] = useState(null);
    const [scannedData, setScannedData] = useState(null);

    const handleScan = (data) => {
        setScannedData(data);
        // Optionally process the scanned data to extract student details or transaction info
        setTransactionId(data.transactionId); // Adjust based on your QR data format
    };

    const handlePaymentProcess = async () => {
        
        const response = await fetch("/hedera-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ studentId, amount, transactionId: scannedData.transactionId }), // Adjust based on scanned data
        });

        const result = await response.json();
        alert(result.message);
    };

    return (
        <div className="payment-component">
            <h1>Payment Section</h1>

            {/* QR Payment Section */}
            <div className="qr-section">
                <QrPayment studentId={studentId} amount={amount} />
                <QrCodeScanner onScan={handleScan} />
            </div>

            {/* Payment Status */}
            <PaymentStatus />

            {/* Receipt and Download */}
            {transactionId && (
                <>
                    <Receipt studentId={studentId} amount={amount} transactionId={transactionId} />
                    <ReceiptDownload />
                </>
            )}

            {/* Complete Payment Button */}
            {scannedData && (
                <button onClick={handlePaymentProcess} className="pay-btn">
                    Complete Payment
                </button>
            )}
        </div>
    );
};

export default Payment;
