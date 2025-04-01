import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Import pages
import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import WelcomePage from "./pages/WelcomePage";

// Import components
import Payment from "./components/Payment";
import PaymentHistory from "./components/PaymentHistory";
import PaymentStatus from "./components/PaymentStatus";
import QrPayment from "./components/QrPayment";
import Receipt from "./components/Receipt";
import ReceiptDownload from "./components/ReceiptDownload";
import Settings from "./components/Settings";
import TransactionHistory from "./components/TransactionHistory";
import VerifyTransaction from "./components/VerifyTransaction";
import Wallet from "./components/Wallet";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payments/qr" element={<QrPayment />} />
        <Route path="/payments/history" element={<PaymentHistory />} />
        <Route path="/payments/status" element={<PaymentStatus />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/transaction-history" element={<TransactionHistory />} />
        <Route path="/verify-transaction" element={<VerifyTransaction />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/receipt/download" element={<ReceiptDownload />} />
      </Routes>
    </Router>
  );
}

export default App;
