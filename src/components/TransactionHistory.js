import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const response = await axios.get("/api/transactions");
                setTransactions(response.data.transactions);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            }
        }
        fetchTransactions();
    }, []);

    return (
        <div className="transaction-history">
            <h2>Transaction History</h2>
            <ul>
                {transactions.map((tx, index) => (
                    <li key={index}>
                        <p><strong>ID:</strong> {tx.transactionId}</p>
                        <p><strong>Amount:</strong> {tx.amount} HBAR</p>
                        <p><strong>Time:</strong> {tx.timestamp}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TransactionHistory;
