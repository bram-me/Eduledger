import React, { useState } from "react";
import axios from "axios";

const ReceiptDownload = () => {
    const [fileId, setFileId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDownload = async () => {
        if (!fileId) {
            setError("Please enter a valid File ID.");
            return;
        }
        
        setLoading(true);
        setError("");

        try {
            const response = await axios.get(
                `http://localhost:5000/download-receipt/${fileId}`,
                { responseType: "blob" } // Ensure it's treated as a file
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `receipt_${fileId}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            setError("Failed to download receipt. Ensure File ID is correct.");
        }

        setLoading(false);
    };

    return (
        <div className="receipt-download">
            <h2>Download Your Receipt</h2>
            <input
                type="text"
                placeholder="Enter Hedera File ID"
                value={fileId}
                onChange={(e) => setFileId(e.target.value)}
            />
            <button onClick={handleDownload} disabled={loading}>
                {loading ? "Downloading..." : "Download Receipt"}
            </button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default ReceiptDownload;
