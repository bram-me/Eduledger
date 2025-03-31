import React, { useState, useEffect } from "react";
import Receipt from "./Receipt";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/payments")
      .then((res) => res.json())
      .then((data) => setPayments(data));
  }, []);

  return (
    <div>
      <h2>Payment History</h2>
      {payments.map((payment) => (
        <div key={payment.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
          <p><strong>Student:</strong> {payment.student_name}</p>
          <p><strong>Amount:</strong> Ksh {payment.amount}</p>
          <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>
          <p><strong>Date:</strong> {new Date(payment.timestamp).toLocaleDateString()}</p>
          <Receipt 
            studentName={payment.student_name} 
            amount={payment.amount} 
            transactionId={payment.transaction_id} 
            date={new Date(payment.timestamp).toLocaleDateString()} 
          />
        </div>
      ))}
    </div>
  );
};

export default PaymentHistory;
