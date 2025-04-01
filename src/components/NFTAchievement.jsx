import React, { useState } from "react";
import { Client, TokenCreateTransaction, TokenSupplyType, Hbar } from "@hashgraph/sdk";
import { FaSpinner, FaCheck, FaTimes } from "react-icons/fa";
import "./NFTAchievement.css"; // Assuming you have the appropriate CSS for styling

const NFTAchievement = () => {
  const [nftId, setNftId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // For success or error status
  const [nftName, setNftName] = useState("Achievement NFT");
  const [nftDescription, setNftDescription] = useState("Awarded for excellent performance");
  const [selectedStudent, setSelectedStudent] = useState(null); // For selecting student

  const students = [
    { id: 1, name: "Emily Johnson" },
    { id: 2, name: "Michael Smith" },
    { id: 3, name: "Sarah Brown" },
    { id: 4, name: "David Wilson" },
  ]; // Example student list

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  const issueNFT = async () => {
    if (!selectedStudent) {
      setStatus({ type: "error", message: "Please select a student!" });
      return;
    }

    setLoading(true);
    setStatus(null); // Reset status before issuing NFT
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    try {
      // Example: Create an NFT for student achievement
      const transaction = await new TokenCreateTransaction()
        .setTokenName(nftName)
        .setTokenSymbol("ANFT")
        .setTreasuryAccountId(accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(1)
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      const tokenId = receipt.tokenId.toString();
      setNftId(tokenId);
      setStatus({ type: "success", message: `NFT Issued! Token ID: ${tokenId} for ${selectedStudent.name}` });
    } catch (error) {
      console.error("Error issuing NFT:", error);
      setStatus({ type: "error", message: "Failed to issue NFT. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="nft-achievement">
      <h2>Issue NFT for Achievement</h2>

      {/* Student Selection */}
      <div className="input-group">
        <label htmlFor="student">Select Student:</label>
        <select
          id="student"
          value={selectedStudent ? selectedStudent.id : ""}
          onChange={(e) => {
            const student = students.find(s => s.id === parseInt(e.target.value));
            setSelectedStudent(student);
          }}
        >
          <option value="">--Select Student--</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}
            </option>
          ))}
        </select>
      </div>

      {/* NFT Name and Description Input */}
      <div className="input-group">
        <label htmlFor="nftName">NFT Name:</label>
        <input
          type="text"
          id="nftName"
          value={nftName}
          onChange={(e) => setNftName(e.target.value)}
          placeholder="Enter NFT Name"
        />
      </div>

      <div className="input-group">
        <label htmlFor="nftDescription">NFT Description:</label>
        <textarea
          id="nftDescription"
          value={nftDescription}
          onChange={(e) => setNftDescription(e.target.value)}
          placeholder="Enter NFT Description"
        />
      </div>

      <button onClick={issueNFT} disabled={loading} className="issue-button">
        {loading ? <FaSpinner className="spinner" /> : "Issue NFT"}
      </button>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.type === "success" ? <FaCheck /> : <FaTimes />}
          {status.message}
        </div>
      )}

      {nftId && !loading && <p className="nft-id">NFT Issued with ID: {nftId}</p>}
    </div>
  );
};

export default NFTAchievement;
