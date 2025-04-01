import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FaUserGraduate, FaMoneyBill, FaDatabase, FaWallet, FaHistory, FaCog, FaCertificate, FaAngleDown, FaAngleUp } from "react-icons/fa";
import "./Dashboard.css";
import edulegderIcon from '../assets/edulegder-icon.svg';
import { Link } from "react-router-dom";


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
  
  const [isContentVisible, setIsContentVisible] = useState(true); // State to control content visibility
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Mobile sidebar toggle
  const location = useLocation();
  const activeItem = location.pathname.split('/')[2] || 'home'; // Get active section based on route

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const savedState = JSON.parse(localStorage.getItem("sidebarState"));
      if (savedState) {
        setCollapsed(savedState);
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
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

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed); // Toggle sidebar visibility on mobile
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <img src={edulegderIcon} alt="EduLedger Icon" className="sidebar-icon" />
          <h2 className="sidebar-title">EduLedger</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="sidebar-link" activeClassName="active-link">Home</NavLink>

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={() => toggleSidebarItem("studentRecords")}>
              <FaUserGraduate className="mr-2" />Students
              {collapsed.studentRecords ? <FaAngleDown className="ml-auto" /> : <FaAngleUp className="ml-auto" />}
            </div>
            {!collapsed.studentRecords && (
              <div className="sidebar-submenu">
                <NavLink to="/dashboard/student-records" className="sidebar-link" activeClassName="active-link">View Students</NavLink>
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
                <NavLink to="/dashboard/payment" className="sidebar-link" activeClassName="active-link">View Payments</NavLink>
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
                <NavLink to="/dashboard/voting" className="sidebar-link" activeClassName="active-link">View Voting</NavLink>
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
                <NavLink to="/dashboard/nft-achievement" className="sidebar-link" activeClassName="active-link">View NFT Achievements</NavLink>
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
                <NavLink to="/dashboard/certifications" className="sidebar-link" activeClassName="active-link">View Certifications</NavLink>
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
                <NavLink to="/dashboard/wallet" className="sidebar-link" activeClassName="active-link">View Wallet</NavLink>
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
                <NavLink to="/dashboard/transaction-history" className="sidebar-link" activeClassName="active-link">View Transactions</NavLink>
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
                <NavLink to="/dashboard/settings" className="sidebar-link" activeClassName="active-link">View Settings</NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Sidebar Toggle */}
        <button onClick={toggleSidebar} className="sidebar-toggle-btn">
          {isSidebarCollapsed ? 'Open Sidebar' : 'Close Sidebar'}
        </button>
      </div>

      {/* Main Content */}
      {/* Main Content */}
<div className={`main-content ${isContentVisible ? "" : "hidden"}`}>
  <h1 className="text-3xl font-bold">{activeItem === 'home' ? 'Home' : activeItem}</h1>

  {/* Render content based on selected item */}
  {activeItem === 'home' && (
    <div className="main-content-container">
      {/* Welcome Message */}
      <div className="welcome-message bg-blue-100 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-3xl font-bold text-blue-800">Welcome back, Admin!</h2>
        <p className="text-xl text-gray-600 mt-2">Here is a quick overview of what's happening in your school.</p>
      </div>

      {/* Stats Dashboard */}
      <div className="dashboard-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card card-blue">
          <FaUserGraduate className="text-3xl mr-4" />
          <div>
            <p className="text-2xl font-bold">1,200</p>
            <p className="text-sm text-gray-500">Total Students</p>
          </div>
        </div>
        <div className="dashboard-card card-green">
          <FaMoneyBill className="text-3xl mr-4" />
          <div>
            <p className="text-2xl font-bold">35,400</p>
            <p className="text-sm text-gray-500">Total Payments</p>
          </div>
        </div>
        <div className="dashboard-card card-yellow">
          <FaDatabase className="text-3xl mr-4" />
          <div>
            <p className="text-2xl font-bold">7,823</p>
            <p className="text-sm text-gray-500">Records Stored</p>
          </div>
        </div>
        <div className="dashboard-card card-purple">
          <FaWallet className="text-3xl mr-4" />
          <div>
            <p className="text-2xl font-bold">5,700</p>
            <p className="text-sm text-gray-500">Wallet Balance</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold text-gray-800">Recent Activity</h3>
        <ul className="mt-4">
          <li className="activity-item">
            <p className="text-sm text-gray-700">New payment received: <span className="font-semibold">$2,000</span></p>
            <span className="text-xs text-gray-500">2 minutes ago</span>
          </li>
          <li className="activity-item">
            <p className="text-sm text-gray-700">Certification issued to: <span className="font-semibold">John Doe</span></p>
            <span className="text-xs text-gray-500">15 minutes ago</span>
          </li>
          <li className="activity-item">
            <p className="text-sm text-gray-700">New student added: <span className="font-semibold">Jane Smith</span></p>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </li>
        </ul>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800">Quick Actions</h3>
        <div className="quick-actions-btns mt-4 flex space-x-4">
          <Link to="/dashboard/student-records" className="quick-action-btn btn-blue">Manage Students</Link>
          <Link to="/dashboard/payment" className="quick-action-btn btn-green">View Payments</Link>
          <Link to="/dashboard/certifications" className="quick-action-btn btn-yellow">Issue Certifications</Link>
        </div>
      </div>
    </div>
  )}

  {/* Outlet for Nested Routes - Render specific components */}
  <Outlet />
</div>

    </div>
  );
};

export default Dashboard;
