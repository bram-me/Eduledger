import React, { useState, useEffect } from "react";
import { Client, TransferTransaction, Hbar } from "@hashgraph/sdk";
import { FaSearch } from "react-icons/fa";
import "./CertificationManager.css";

const CertificationManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const certificatesPerPage = 5; // Number of certificates per page

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  useEffect(() => {
    // Fetch certificates (mocked data for now)
    setCertificates([
      { studentId: 1, course: "Math 101", date: "2025-04-01", status: "Issued" },
      { studentId: 2, course: "Science 101", date: "2025-04-01", status: "Issued" },
      // Add more mocked data for testing...
    ]);
  }, []);

  const issueCertificate = async (studentId, certificateData) => {
    setLoading(true);
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    try {
      const transaction = await new TransferTransaction()
        .addHbarTransfer(accountId, new Hbar(-1)) // Deducting fee for issuing certificate
        .addHbarTransfer("0.0.123456", new Hbar(1)) // Sending fee or value for the certificate issuance
        .execute(client);

      const receipt = await transaction.getReceipt(client);
      alert("Certificate Issued! Status: " + receipt.status.toString());

      setCertificates([...certificates, certificateData]);
    } catch (error) {
      console.error("Error issuing certificate:", error);
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const filteredCertificates = certificates.filter((cert) =>
    cert.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCertificates.length / certificatesPerPage);
  const currentCertificates = filteredCertificates.slice(
    (page - 1) * certificatesPerPage,
    page * certificatesPerPage
  );

  return (
    <div className="certification-manager">
      <h2 className="title">Certification Management</h2>
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search Certificates"
          className="search-input"
        />
        <FaSearch className="search-icon" />
      </div>

      <button
        onClick={() => issueCertificate(1, { studentId: 1, course: "Math 101", date: "2025-04-01", status: "Pending" })}
        className="issue-button"
        disabled={loading}
      >
        {loading ? "Issuing..." : "Issue Certificate"}
      </button>

      <div className="certificate-list">
        {loading ? (
          <div className="loading">Issuing certificate... Please wait.</div>
        ) : (
          <>
            <ul>
              {currentCertificates.map((cert, index) => (
                <li key={index} className="certificate-item">
                  <span className="certificate-id">Student ID: {cert.studentId}</span>
                  <span className="certificate-course">Course: {cert.course}</span>
                  <span className="certificate-date">Issued on: {cert.date}</span>
                  <span className={`certificate-status ${cert.status.toLowerCase()}`}>
                    {cert.status}
                  </span>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            <div className="pagination">
              <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CertificationManager;
