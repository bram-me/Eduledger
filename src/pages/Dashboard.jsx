import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { FaUserGraduate, FaMoneyBill, FaDatabase, FaWallet, FaHistory, FaCog, FaCertificate, FaAngleDown, FaAngleUp } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState({
    studentRecords: false,
    payment: false,
    voting: false,
    nftAchievement: false,
    certifications: false,
    wallet: false,
    transactionHistory: false,
    settings: false,
  });

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem("sidebarState"));
    if (savedState) {
      setCollapsed(savedState);
    }
  }, []);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarState", JSON.stringify(collapsed));
  }, [collapsed]);

  const toggleSidebarItem = (item) => {
    setCollapsed((prevState) => ({
      ...prevState,
      [item]: !prevState[item],
    }));
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header flex items-center mb-6">
          <img src="../assets/edulegder-icon.svg" alt="EduLedger Icon" className="text-white text-3xl mr-2" />
          <h2 className="text-white text-2xl font-bold">EduLedger</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="sidebar-link">Home</Link>
          
          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("studentRecords")}>
              <FaUserGraduate className="mr-2" />Students
              {collapsed.studentRecords ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.studentRecords && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/student-records" className="sidebar-link">View Students</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("payment")}>
              <FaMoneyBill className="mr-2" />Payments
              {collapsed.payment ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.payment && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/payment" className="sidebar-link">View Payments</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("voting")}>
              <FaCertificate className="mr-2" />Voting System
              {collapsed.voting ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.voting && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/voting" className="sidebar-link">View Voting</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("nftAchievement")}>
              <FaCertificate className="mr-2" />NFT Achievements
              {collapsed.nftAchievement ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.nftAchievement && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/nft-achievement" className="sidebar-link">View NFT Achievements</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("certifications")}>
              <FaCertificate className="mr-2" />Certification Manager
              {collapsed.certifications ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.certifications && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/certifications" className="sidebar-link">View Certifications</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("wallet")}>
              <FaWallet className="mr-2" />Wallet
              {collapsed.wallet ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.wallet && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/wallet" className="sidebar-link">View Wallet</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("transactionHistory")}>
              <FaHistory className="mr-2" />Transactions
              {collapsed.transactionHistory ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.transactionHistory && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/transaction-history" className="sidebar-link">View Transactions</Link>
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("settings")}>
              <FaCog className="mr-2" />Settings
              {collapsed.settings ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.settings && (
              <div className="sidebar-submenu">
                <Link to="/dashboard/settings" className="sidebar-link">View Settings</Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="text-3xl font-bold">Home</h1>
        <div className="bg-white p-6 rounded-xl shadow-md mt-4">
          <h2 className="text-xl font-semibold">Welcome back, Admin!</h2>
          <p>Here is an overview of activities in your school.</p>
          <div className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="dashboard-card card-blue">
              <FaUserGraduate className="text-2xl mr-2" />
              <div>
                <p className="text-2xl font-bold">1,200</p>
                <p>Total Students</p>
              </div>
            </div>
            <div className="dashboard-card card-green">
              <FaMoneyBill className="text-2xl mr-2" />
              <div>
                <p className="text-2xl font-bold">35,400</p>
                <p>Total Payments</p>
              </div>
            </div>
            <div className="dashboard-card card-yellow">
              <FaDatabase className="text-2xl mr-2" />
              <div>
                <p className="text-2xl font-bold">7,823</p>
                <p>Records Stored</p>
              </div>
            </div>
          </div>
        </div>

        {/* Outlet for Nested Routes - Render specific components */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
