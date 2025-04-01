import React, { useRef } from "react";
import ReactToPdf from "react-to-pdf";

const Receipt = ({ studentId, amount, transactionId }) => {
    const receiptRef = useRef();

    return (
        <div className="receipt-container">
            <ReactToPdf targetRef={receiptRef} filename={`EduLedger_Receipt_${transactionId}.pdf`}>
                {({ toPdf }) => (
                    <>
                        <div ref={receiptRef} className="receipt">
                            <h2>EduLedger Payment Receipt</h2>
                            <p><strong>Transaction ID:</strong> {transactionId}</p>
                            <p><strong>Student ID:</strong> {studentId}</p>
                            <p><strong>Amount Paid:</strong> ${amount}</p>
                            <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                            <p>Thank you for using EduLedger!</p>
                        </div>
                        <button className="download-btn" onClick={toPdf}>
                            Download Receipt (PDF)
                        </button>
                    </>
                )}
            </ReactToPdf>
        </div>
    );
};

export default Receipt;
