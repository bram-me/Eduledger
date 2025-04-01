import React from "react";
import { Outlet, Link } from "react-router-dom";
import { FaUserGraduate, FaMoneyBill, FaDatabase, FaSchool, FaWallet, FaHistory, FaCog } from "react-icons/fa";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header flex items-center mb-6">
          <FaSchool className="text-white text-3xl mr-2" />
          <h2 className="text-2xl font-bold text-white">EduLedger</h2>
        </div>
        <Link to="/">Dashboard</Link>
        <Link to="/students">Students</Link>
        <Link to="/payments">Payments</Link>
        <Link to="/wallet"><FaWallet className="mr-2" />Wallet</Link>
        <Link to="/transaction-history"><FaHistory className="mr-2" />Transactions</Link>
        <Link to="/settings"><FaCog className="mr-2" />Settings</Link>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="bg-white p-6 rounded-xl shadow-md mt-4">
          <h2 className="text-xl font-semibold">Welcome back, Admin!</h2>
          <p>Here is an overview of activities in your school.</p>
          <div className="dashboard-cards grid grid-cols-3 gap-4 mt-4">
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
        <div className="bg-white p-6 rounded-xl shadow-md mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Students</h2>
            <Link to="/students" className="text-blue-500">View All</Link>
          </div>
          <table className="w-full mt-4 border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Class</th>
                <th className="text-left p-2">School</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {["Emily Johnson", "Michael Smith", "Sarah Brown", "David Wilson"].map((student, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{student}</td>
                  <td className="p-2">Grade {10 + index}</td>
                  <td className="p-2">Greenwood High</td>
                  <td className="p-2">
                    <span className={`badge ${index % 2 === 0 ? "badge-paid" : "badge-pending"}`}>
                      {index % 2 === 0 ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Outlet for Nested Routes */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
