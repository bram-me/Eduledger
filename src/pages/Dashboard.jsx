import React from "react";
import { FaUserGraduate, FaMoneyBill, FaDatabase } from "react-icons/fa";
import "./Dashboard.css"; // Import dashboard-specific styles

const Dashboard = () => {
  return (
    <div className="dashboard min-h-screen bg-gray-100 p-6">
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
          <a href="/students" className="text-blue-500">View All</a>
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
    </div>
  );
};

export default Dashboard;
