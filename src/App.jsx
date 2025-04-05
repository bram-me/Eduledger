import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Import pages
import Dashboard from "./pages/Dashboard";
import WelcomePage from "./pages/WelcomePage";

// Import components
import Payment from "./components/Payment";  // Payment includes PaymentHistory, PaymentStatus, etc.
import Wallet from "./components/Wallet";    // Wallet includes TransactionHistory, VerifyTransaction, etc.
import Settings from "./components/Settings";
import StudentRecords from "./components/StudentRecords"; // New component
import VotingSystem from "./components/VotingSystem"; // New component
import NFTAchievement from "./components/NFTAchievement"; // New component
import CertificationManager from "./components/CertificationManager"; // New component

// Import styles
import "./App.css"; // Global styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<Dashboard />} >
          {/* Nested routes inside Dashboard */}
          <Route path="payment" element={<Payment />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="settings" element={<Settings />} />
          <Route path="student-records" element={<StudentRecords />} /> {/* Student Records */}
          <Route path="voting" element={<VotingSystem />} /> {/* Voting System */}
          <Route path="nft-achievement" element={<NFTAchievement />} /> {/* NFT Achievement */}
          <Route path="certifications" element={<CertificationManager />} /> {/* Certification Management */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
