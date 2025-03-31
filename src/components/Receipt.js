import React from "react";
import jsPDF from "jspdf";

const Receipt = ({ accountId, amount, transactionId }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("EduLedger Payment Receipt", 20, 20);
    doc.text(`Account ID: ${accountId}`, 20, 30);
    doc.text(`Amount: ${amount} HBAR`, 20, 40);
    doc.text(`Transaction ID: ${transactionId}`, 20, 50);
    doc.save("receipt.pdf");
  };

  return (
    <div className="receipt-container">
      <h2>Download Receipt</h2>
      <button onClick={generatePDF}>Download</button>
    </div>
  );
};

export default Receipt;
