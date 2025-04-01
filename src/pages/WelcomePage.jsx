import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";  // Import for global styles (app.css)
import "./WelcomePage.css";  // Import for specific styles (welcomepage.css)
import { motion } from "framer-motion";
import { FaGraduationCap, FaLock, FaChartBar, FaRegCheckCircle, FaCertificate, FaWallet, FaHistory, FaCog } from "react-icons/fa";
import edulegderIcon from '../assets/edulegder-icon.svg';

// Testimonial data (can be replaced with real testimonials later)
const testimonials = [
  {
    name: "John Doe",
    role: "Student",
    feedback: "EduLedger transformed my school experience! Secure, fast, and transparent records management."
  },
  {
    name: "Jane Smith",
    role: "Teacher",
    feedback: "A game changer for fee payments and student performance tracking. Very user-friendly!"
  },
  {
    name: "Mark Brown",
    role: "Administrator",
    feedback: "Efficient, decentralized, and secure. EduLedger is the future of school management."
  }
];

const WelcomePage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Cycle through testimonials every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#2D91B9] to-[#61C1A2] text-white relative">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="hero text-center p-10 md:p-20 relative z-10"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: 'url(/assets/hero-bg.jpg)' }}></div>

        {/* EduLedger Logo */}
        <div className="logo-container mb-6">
          <img src={edulegderIcon} alt="EduLedger Logo" className="eduledger-logo mx-auto w-24 md:w-32" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#2D91B9] to-[#61C1A2]">
          EduLedger
        </h1>
        <p className="text-lg sm:text-xl mt-4 text-gray-100 max-w-3xl mx-auto">
          A next-generation blockchain-powered school management system that empowers educational institutions with secure, decentralized, and efficient record-keeping, payments, and more.
        </p>
        <Link to="/dashboard">
          <button className="get-started-btn mt-8 py-3 px-8 bg-[#2D91B9] hover:bg-[#1C6B81] text-white font-semibold rounded-lg shadow-lg transition-all duration-300">
            Get Started
          </button>
        </Link>
      </motion.div>

      {/* Features Section */}
      <div className="features grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-16 mb-16">
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

      {/* Testimonial Section */}
      <div className="testimonial-section bg-[#F0F4F8] p-10 mt-16 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4">What Our Users Say</h2>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="testimonial-card p-6 bg-white rounded-lg shadow-lg text-center"
        >
          <p className="text-gray-600 italic">"{testimonials[activeTestimonial].feedback}"</p>
          <h4 className="font-semibold text-xl mt-4">{testimonials[activeTestimonial].name}</h4>
          <p className="text-gray-500">{testimonials[activeTestimonial].role}</p>
        </motion.div>
      </div>

      {/* Contact Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="contact-btn p-4 bg-[#2D91B9] text-white rounded-full shadow-lg hover:bg-[#1C6B81] transition-all duration-300"
          onClick={() => alert("Contact form will appear here!")}
        >
          <FaCog size={24} />
        </motion.button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)" }}
      className="feature-box p-6 bg-white shadow-lg rounded-2xl text-center transition-transform duration-300"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-500 mt-2">{description}</p>
    </motion.div>
  );
};

export default WelcomePage;
