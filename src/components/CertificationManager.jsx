import React, { useState, useEffect } from "react";
import {
  Client,
  FileCreateTransaction,
  FileContentsQuery,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenNftInfoQuery,
  TokenAssociateTransaction,
  PrivateKey,
  TokenId,
} from "@hashgraph/sdk";
import QRCode from "react-qr-code";
import "./CertificationManager.css";

const CertificationManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [formData, setFormData] = useState({ studentId: "", course: "", date: "", status: "Issued" });
  const [preview, setPreview] = useState(null);
  const [nftCollectionId, setNftCollectionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const accountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
  const privateKey = PrivateKey.fromString(import.meta.env.VITE_HEDERA_PRIVATE_KEY);
  const client = Client.forTestnet().setOperator(accountId, privateKey);

  useEffect(() => {
    fetchIssuedCertificates();
  }, []);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const generatePreview = () => {
    setPreview({ ...formData, issuedBy: "My Institute" });
  };

  const createNftCollection = async () => {
    setLoading(true);
    try {
      const tx = await new TokenCreateTransaction()
        .setTokenName("CertificateNFT")
        .setTokenSymbol("CERT")
        .setTreasuryAccountId(accountId)
        .setAdminKey(privateKey)
        .setSupplyKey(privateKey)
        .setTokenType(1)
        .setInitialSupply(0)
        .execute(client);

      const receipt = await tx.getReceipt(client);
      setNftCollectionId(receipt.tokenId.toString());
      alert(`NFT Collection Created: ${receipt.tokenId}`);
    } catch (error) {
      console.error("NFT Collection Error:", error);
    }
    setLoading(false);
  };

  const storeCertificateFile = async (certificateData) => {
    const fileContent = JSON.stringify(certificateData);
    const tx = await new FileCreateTransaction()
      .setContents(fileContent)
      .execute(client);
    const receipt = await tx.getReceipt(client);
    return receipt.fileId.toString();
  };

  const issueCertificateNFT = async () => {
    setLoading(true);
    try {
      if (!nftCollectionId) return alert("Create NFT collection first!");

      const fileId = await storeCertificateFile(preview);
      const metadata = JSON.stringify({ fileId });

      await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([nftCollectionId])
        .execute(client);

      const mintTx = await new TokenMintTransaction()
        .setTokenId(nftCollectionId)
        .setMetadata([Buffer.from(metadata)])
        .execute(client);

      const receipt = await mintTx.getReceipt(client);
      setCertificates([...certificates, { ...preview, nftId: receipt.tokenId.toString(), fileId }]);
      alert("Certificate Issued as NFT!");
    } catch (error) {
      console.error("Issue NFT Error:", error);
    }
    setLoading(false);
  };

  const fetchIssuedCertificates = async () => {
    try {
      if (!nftCollectionId) return;
      const tokenId = TokenId.fromString(nftCollectionId);

      for (let i = 1; i <= 10; i++) {
        try {
          const nftInfo = await new TokenNftInfoQuery()
            .setTokenId(tokenId)
            .setSerialNumber(i)
            .execute(client);

          const metadata = JSON.parse(nftInfo.metadata.toString());
          const fileId = metadata.fileId;

          const fileQuery = await new FileContentsQuery().setFileId(fileId).execute(client);
          const certificateData = JSON.parse(fileQuery.toString());

          setCertificates((prev) => [...prev, { ...certificateData, nftId: tokenId.toString(), fileId }]);
        } catch (err) {
          console.log("No more NFTs found.");
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  return (
    <div className="certification-manager">
      <h2>Certification Management</h2>

      <div className="form-container">
        <input type="text" name="studentId" placeholder="Student ID" onChange={handleInputChange} />
        <input type="text" name="course" placeholder="Course Name" onChange={handleInputChange} />
        <input type="date" name="date" onChange={handleInputChange} />
        <button onClick={generatePreview}>Preview Certificate</button>
      </div>

      {preview && (
        <div className="preview-card">
          <h3>Certificate Preview</h3>
          <p>Student ID: {preview.studentId}</p>
          <p>Course: {preview.course}</p>
          <p>Date: {preview.date}</p>
          <p>Status: {preview.status}</p>
          <p>Issued By: {preview.issuedBy}</p>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={createNftCollection} disabled={loading}>
          {loading ? "Creating NFT Collection..." : "Create NFT Collection"}
        </button>
        <button onClick={issueCertificateNFT} disabled={loading || !preview}>
          {loading ? "Issuing Certificate..." : "Issue Certificate as NFT"}
        </button>
        <button onClick={fetchIssuedCertificates}>Fetch Issued Certificates</button>
      </div>

      <h3>Issued Certificates</h3>
      <ul className="certificate-list">
        {certificates.map((cert, index) => (
          <li key={index} className="certificate-item">
            <p><strong>Student ID:</strong> {cert.studentId}</p>
            <p><strong>Course:</strong> {cert.course}</p>
            <p><strong>NFT ID:</strong> {cert.nftId}</p>
            <p><strong>File ID:</strong> {cert.fileId}</p>
            <div className="qr-code">
              <QRCode value={`https://hashscan.io/testnet/token/${cert.nftId}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CertificationManager;
