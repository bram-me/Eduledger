// StudentRecords.jsx
import React, { useState } from 'react';
import './StudentRecords.css'; // Custom styles for the component
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const StudentRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample student data
  const students = [
    { name: "Emily Johnson", grade: "Grade 10", school: "Greenwood High", status: "Active" },
    { name: "Michael Smith", grade: "Grade 12", school: "Riverside School", status: "Inactive" },
    { name: "Sarah Brown", grade: "Grade 11", school: "Sunshine Academy", status: "Active" },
    { name: "David Wilson", grade: "Grade 9", school: "Oakwood Academy", status: "Active" },
  ];

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="student-records">
      <h2 className="text-xl font-semibold">Student Records</h2>
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search by student name..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <FaSearch className="search-icon" />
      </div>
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={index}>
              <td>{student.name}</td>
              <td>{student.grade}</td>
              <td>{student.school}</td>
              <td>{student.status}</td>
              <td>
                <FaEdit className="edit-icon" />
                <FaTrash className="delete-icon" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRecords;
