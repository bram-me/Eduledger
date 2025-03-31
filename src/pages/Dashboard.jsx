import React from "react";
import { FaUserGraduate, FaMoneyBill, FaDatabase } from "react-icons/fa";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="bg-white p-6 rounded-xl shadow-md mt-4">
        <h2 className="text-xl font-semibold">Welcome back, Admin!</h2>
        <p>Here is an overview of activities in your school.</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-blue-500 text-white p-4 rounded-lg flex items-center">
            <FaUserGraduate className="text-2xl mr-2" />
            <div>
              <p className="text-2xl font-bold">1,200</p>
              <p>Total Students</p>
            </div>
          </div>
          <div className="bg-green-500 text-white p-4 rounded-lg flex items-center">
            <FaMoneyBill className="text-2xl mr-2" />
            <div>
              <p className="text-2xl font-bold">35,400</p>
              <p>Total Payments</p>
            </div>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg flex items-center">
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
                  <span className={`px-2 py-1 text-white rounded ${index % 2 === 0 ? "bg-green-500" : "bg-yellow-500"}`}>
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
