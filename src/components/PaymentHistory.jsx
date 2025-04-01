import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/payments")
            .then(response => response.json())
            .then(data => setPayments(data))
            .catch(error => console.error("Error fetching payments:", error));
    }, []);

    const downloadReceipt = (payment) => {
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("EduLedger Payment Receipt", 20, 20);

        doc.setFontSize(12);
        doc.text(`Student Name: ${payment.student_name}`, 20, 40);
        doc.text(`Transaction ID: ${payment.transaction_id}`, 20, 50);
        doc.text(`Amount Paid: KES ${payment.amount}`, 20, 60);
        doc.text(`Date: ${new Date(payment.timestamp).toLocaleString()}`, 20, 70);

        doc.save(`Receipt_${payment.transaction_id}.pdf`);
    };

    return (
        <div>
            <h2>Payment History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Amount (KES)</th>
                        <th>Transaction ID</th>
                        <th>Date</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id}>
                            <td>{payment.student_name}</td>
                            <td>{payment.amount}</td>
                            <td>{payment.transaction_id}</td>
                            <td>{new Date(payment.timestamp).toLocaleString()}</td>
                            <td>
                                <button onClick={() => downloadReceipt(payment)}>Download PDF</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentHistory;
