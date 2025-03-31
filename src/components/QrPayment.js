import React, { useState } from "react";
import QRCode from "qrcode.react";

const QrPayment = () => {
    const [amount, setAmount] = useState("");
    const [qrValue, setQrValue] = useState("");

    const generateQrCode = () => {
        const qrData = `hedera:pay?recipient=${process.env.HEDERA_ACCOUNT_ID}&amount=${amount}`;
        setQrValue(qrData);
    };

    return (
        <div className="qr-payment">
            <h2>Pay with QR Code</h2>
            <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={generateQrCode}>Generate QR</button>
            {qrValue && <QRCode value={qrValue} size={150} />}
        </div>
    );
};

export default QrPayment;
