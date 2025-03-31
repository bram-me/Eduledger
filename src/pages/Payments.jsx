import { useState } from "react";
import QRCodePayment from "../components/QrPayment";
// import QRCodeScanner from "..components/QRCodeScanner";
import Receipt from "../components/Receipt";

const PaymentPage = () => {
    const [studentId, setStudentId] = useState("");
    const [amount, setAmount] = useState("");
    const [scannedData, setScannedData] = useState(null);
    const [receiptData, setReceiptData] = useState(null);

    const handleScan = (data) => {
        setScannedData(data);
    };

    const processPayment = async () => {
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
            alert("Payment failed. Try again.");
        }
    };

    return (
        <div className="payment-page">
            <h1>EduLedger Payments</h1>
            <div className="qr-section">
                <QRCodePayment studentId={studentId} amount={amount} />
                <QRCodeScanner onScan={handleScan} />
            </div>
            {scannedData && !receiptData && (
                <button onClick={processPayment} className="pay-btn">Complete Payment</button>
            )}
            {receiptData && <Receipt {...receiptData} />}
        </div>
    );
};

export default PaymentPage;
