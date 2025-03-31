import { useState, useEffect } from "react";

const PaymentStatus = () => {
    const [status, setStatus] = useState("Pending...");
    const [transactionId, setTransactionId] = useState(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000");

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTransactionId(data.transactionId);
            setStatus(data.status === "completed" ? "✅ Payment Successful" : "❌ Payment Failed");
        };

        return () => ws.close();
    }, []);

    return (
        <div className="payment-status">
            <h2>Live Payment Status</h2>
            <p>{status}</p>
            {transactionId && <p>Transaction ID: {transactionId}</p>}
        </div>
    );
};

export default PaymentStatus;
