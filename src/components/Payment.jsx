import { useState } from "react";
import QRCodePayment from "./QrCodePayment";
// import QRCodeScanner from "./QRCodeScanner";

const PaymentPage = () => {
    const [studentId, setStudentId] = useState("");
    const [amount, setAmount] = useState("");
    const [scannedData, setScannedData] = useState(null);

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
        alert(result.message);
    };

    return (
        <div className="payment-page">
            <h1>EduLedger Payments</h1>
            <div className="qr-section">
                <QRCodePayment studentId={studentId} amount={amount} />
                <QRCodeScanner onScan={handleScan} />
            </div>
            {scannedData && (
                <button onClick={processPayment} className="pay-btn">Complete Payment</button>
            )}
        </div>
    );
};

export default PaymentPage;
