import React from "react";
import { Link } from "react-router-dom";
import "../App.css";  // Import for global styles (app.css)
import "./Welcomepage.css";  // Import for specific styles (welcomepage.css)
import { motion } from "framer-motion";
import { FaGraduationCap, FaLock, FaChartBar, FaRegCheckCircle, FaCertificate, FaWallet, FaHistory, FaCog } from "react-icons/fa";

const WelcomePage = () => {
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="hero text-center mb-12"
      >
        <h1 className="text-5xl font-bold">Welcome to EduLedger</h1>
        <p className="text-lg mt-4 text-gray-600">
          A next-generation blockchain-powered school management system.
        </p>
        <Link to="/dashboard">
          <button className="get-started-btn mt-6">
            Get Started
          </button>
        </Link>
      </motion.div>

      {/* Features Section */}
      <div className="features grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <FeatureCard
          icon={<FaGraduationCap size={40} className="text-blue-500" />}
          title="Decentralized Records"
          description="Secure and transparent academic records stored on Hedera."
        />
        <FeatureCard
          icon={<FaLock size={40} className="text-green-500" />}
          title="Secure Fee Payments"
          description="Instant, low-cost payments using Hedera Token Service (HTS)."
        />
        <FeatureCard
          icon={<FaRegCheckCircle size={40} className="text-red-500" />}
          title="Voting System"
          description="Decentralized and secure voting for school elections."
        />
        <FeatureCard
          icon={<FaCertificate size={40} className="text-yellow-500" />}
          title="NFT Achievements"
          description="NFT-based achievements and rewards for students."
        />
        <FeatureCard
          icon={<FaCertificate size={40} className="text-purple-500" />}
          title="Certification Manager"
          description="Manage and issue blockchain-certified student records."
        />
        <FeatureCard
          icon={<FaWallet size={40} className="text-indigo-500" />}
          title="Wallet Management"
          description="Manage digital wallets for fee payments and rewards."
        />
        <FeatureCard
          icon={<FaHistory size={40} className="text-teal-500" />}
          title="Transaction History"
          description="Track and view all fee transactions and history."
        />
        <FeatureCard
          icon={<FaChartBar size={40} className="text-orange-500" />}
          title="Advanced Analytics"
          description="Track school performance and student progress effortlessly."
        />
        <FeatureCard
          icon={<FaCog size={40} className="text-gray-500" />}
          title="Settings"
          description="Manage system preferences, user roles, and more."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
      className="feature-box p-6 bg-white shadow-lg rounded-2xl text-center"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-500 mt-2">{description}</p>
    </motion.div>
  );
};

export default WelcomePage;
