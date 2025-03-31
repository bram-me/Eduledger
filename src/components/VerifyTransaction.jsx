import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const VerifyTransaction = () => {
    const { transactionId } = useParams();
    const [transaction, setTransaction] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`http://localhost:5000/api/verify/${transactionId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setTransaction(data);
                }
            })
            .catch(() => setError('Error fetching transaction'));
    }, [transactionId]);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Transaction Verification</h2>
            {transaction ? (
                <div>
                    <p><strong>Transaction ID:</strong> {transaction.transaction_id}</p>
                    <p><strong>Student ID:</strong> {transaction.student_id}</p>
                    <p><strong>Amount:</strong> {transaction.amount} HBAR</p>
                    <p><strong>Status:</strong> {transaction.status}</p>
                    <p><strong>Timestamp:</strong> {transaction.timestamp}</p>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default VerifyTransaction;
