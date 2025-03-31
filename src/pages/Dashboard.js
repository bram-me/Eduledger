import React, { useState } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const transactions = [
    { id: 1, date: "2025-03-30", amount: "500 HBAR", status: "Completed" },
    { id: 2, date: "2025-03-25", amount: "750 HBAR", status: "Pending" },
    { id: 3, date: "2025-03-20", amount: "1200 HBAR", status: "Completed" },
  ];

  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      <header>
        <h1>EduLedger Dashboard</h1>
        <button onClick={toggleDarkMode}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <section className="balance">
        <h2>Wallet Balance</h2>
        <p>3,450 HBAR</p>
      </section>

      <section className="transactions">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.amount}</td>
                <td className={tx.status.toLowerCase()}>{tx.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
