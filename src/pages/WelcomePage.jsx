import React, { useState } from "react";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import { FaChartLine, FaLock, FaTrophy, FaUsers, FaBook, FaWallet, FaHistory, FaCog, FaGraduationCap } from "react-icons/fa"; // Importing icons
import "./WelcomePage.css"; // Import the external CSS
import decentralizedRecords from "../assets/decentralized-records.jpg";
import secureFeePayments from "../assets/secure-fee-payments.jpg";
import votingSystem from "../assets/voting-system.jpg";
import nftAchievements from "../assets/nft-achievements.jpg";
import certificationManager from "../assets/certification-manager.jpg";
import walletManagement from "../assets/wallet-management.jpg";
import transactionHistory from "../assets/transaction-history.jpg";
import advancedAnalytics from "../assets/advanced-analytics.png";
import settings from "../assets/settings.jpg";

const WelcomePage = () => {
  const [flippedCard, setFlippedCard] = useState(null);

  const handleCardClick = (index) => {
    setFlippedCard(index === flippedCard ? null : index);
  };

  const getFeatureTitle = (index) => {
    switch (index) {
      case 0: return "Decentralized Records";
      case 1: return "Secure Fee Payments";
      case 2: return "Voting System";
      case 3: return "NFT Achievements";
      case 4: return "Certification Manager";
      case 5: return "Wallet Management";
      case 6: return "Transaction History";
      case 7: return "Advanced Analytics";
      case 8: return "Settings";
      default: return "";
    }
  };

  const getFeatureDescription = (index) => {
    switch (index) {
      case 0: return "Secure and transparent academic records stored on Hedera.";
      case 1: return "Instant, low-cost payments using Hedera Token Service (HTS).";
      case 2: return "Decentralized and secure voting for school elections.";
      case 3: return "NFT-based achievements and rewards for students.";
      case 4: return "Manage and issue blockchain-certified student records.";
      case 5: return "Manage digital wallets for fee payments and rewards.";
      case 6: return "Track and view all fee transactions and history.";
      case 7: return "Track school performance and student progress effortlessly.";
      case 8: return "Manage system preferences, user roles, and more.";
      default: return "";
    }
  };

  const getFeatureImage = (index) => {
    switch (index) {
      case 0: return decentralizedRecords;
      case 1: return secureFeePayments;
      case 2: return votingSystem;
      case 3: return nftAchievements;
      case 4: return certificationManager;
      case 5: return walletManagement;
      case 6: return transactionHistory;
      case 7: return advancedAnalytics;
      case 8: return settings;
      default: return "";
    }
  };

  const getFeatureIcon = (index) => {
    switch (index) {
      case 0: return <FaGraduationCap />;
      case 1: return <FaWallet />;
      case 2: return <FaUsers />;
      case 3: return <FaTrophy />;
      case 4: return <FaBook />;
      case 5: return <FaLock />;
      case 6: return <FaHistory />;
      case 7: return <FaChartLine />;
      case 8: return <FaCog />;
      default: return null;
    }
  };

  return (
    <div className="welcome-page">
      <section className="hero-section">
  <div className="hero-overlay"></div>
  <div className="hero-content">
    <h1 className="hero-title">
       <span className="highlight">EduLedger</span>
    </h1>
    <p className="hero-subtitle">
      Revolutionizing education with Hedera's blockchain technology.
      Secure, transparent, and scalable.
    </p>
    <div className="cta-buttons">
      <a href="/dashboard" className="cta-btn primary">
        Get Started
      </a>
      <a href="#stats" className="cta-btn secondary">
        Learn More
      </a>
    </div>
  </div>
  {/* Social Media Icons */}
  <div className="social-icons">
    <a href="https://x.com/ElimuLedger" target="_blank" rel="noreferrer">
      <FaTwitter />
    </a>
    <a href="https://substack.com/@eduledger" target="_blank" rel="noreferrer">
      <FaGithub />
    </a>
    <a href="https://www.linkedin.com/in/bramwel-vasaka" target="_blank" rel="noreferrer">
      <FaLinkedin />
    </a>
  </div>
</section>


{/* Stats Section */}
<section id="stats" className="stats-section">
  <div className="container">
    {/* Title */}
    <h2 className="section-title">Features</h2>
    <div className="card-container">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div
          key={index}
          className={`card ${flippedCard === index ? "flipped" : ""}`}
          onClick={() => handleCardClick(index)}
        >
          <div className="front">
            <div className="icon-container">
              {getFeatureIcon(index)} {/* Icon */}
            </div>
            <h3>{getFeatureTitle(index)}</h3>
            <p>{getFeatureDescription(index)}</p>
          </div>
          <div className="back">
            <img src={getFeatureImage(index)} alt="Feature" />
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* YouTube Video Section */}
<section className="video-section" id="video">
  <div className="container">
    <h2 className="section-title">Watch Our Demo</h2>
    <iframe
      width="100%"
      height="500"
      src="https://www.youtube.com/embed/C-VKuz82g-c"
      title="EduLedger Demo"
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
</section>

{/* FAQ Section */}
<section className="faq-section">
  <div className="container">
    <h2 className="section-title">Frequently Asked Questions</h2>
    <div className="faq-item">
      <h4>What is EduLedger?</h4>
      <p>EduLedger is a blockchain-based platform that secures education credentials.</p>
    </div>
    <div className="faq-item">
      <h4>How does EduLedger work?</h4>
      <p>It uses Hedera’s blockchain technology to store, verify, and manage educational records.</p>
    </div>
    <div className="faq-item">
      <h4>Is my data safe?</h4>
      <p>Yes, Hedera ensures the highest level of security and transparency for all data.</p>
    </div>
  </div>
</section>

{/* Testimonials Section */}
<section className="testimonials-section">
  <div className="container">
    <h2 className="section-title">What People Are Saying</h2>
    <div className="testimonial-card">
      <p>
        "EduLedger has transformed the way we manage educational records. Blockchain has provided unparalleled security and transparency."
      </p>
      <div className="testimonial-author">
        <div className="avatar">A</div>
        <div className="author-details">
          <h4>Alex J.</h4>
          <p>University of Blockchain</p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* Substack Section */}
<section className="substack-section">
  <div className="container">
    <h2 className="section-title">Stay Updated</h2>
    <div className="substack-card">
      <a href="https://substack.com/@eduledger" target="_blank" rel="noopener noreferrer">
        <div className="newspaper-icon">📰</div>
        <p>Subscribe to our newsletter for the latest updates and news!</p>
      </a>
    </div>
  </div>
</section>


      {/* Footer Section */}
      <footer className="footer-section">
        <div className="container">
          <p>&copy; 2025 EduLedger. All rights reserved.</p>
          <div className="social-footer">
            <a href="https://x.com/ElimuLedger" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
            <a href="https://substack.com/@eduledger" target="_blank" rel="noreferrer">
              <FaGithub />
            </a>
            <a href="https://www.linkedin.com/in/bramwel-vasaka" target="_blank" rel="noreferrer">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
