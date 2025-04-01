import React from "react";
import "../App.css";  // Import for global styles (app.css)
import "./Welcomepage.css";  // Import for specific styles (welcomepage.css)
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FaGraduationCap, FaLock, FaChartBar } from "react-icons/fa";

const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold text-blue-600">Welcome to EduLedger</h1>
        <p className="text-gray-600 text-lg mt-4">
          A next-generation blockchain-powered school management system.
        </p>
        <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg">
          Get Started
        </Button>
      </motion.div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
          icon={<FaChartBar size={40} className="text-purple-500" />}
          title="Advanced Analytics"
          description="Track school performance and student progress effortlessly."
        />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-lg rounded-2xl p-6 text-center"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-gray-500 mt-2">{description}</p>
    </motion.div>
  );
};

export default WelcomePage;
