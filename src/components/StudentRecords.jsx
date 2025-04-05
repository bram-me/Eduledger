import React, { useState } from 'react';
import './StudentRecords.css'; // Custom styles for the component
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';

const StudentRecords = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([
    { name: "Emily Johnson", grade: "Grade 10", status: "Active", feeStatus: "Paid" },
    { name: "Michael Smith", grade: "Grade 12", status: "Inactive", feeStatus: "Pending" },
    { name: "Sarah Brown", grade: "Grade 11", status: "Active", feeStatus: "Paid" },
    { name: "David Wilson", grade: "Grade 9", status: "Active", feeStatus: "Pending" },
  ]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedStudent, setUpdatedStudent] = useState(null);

  const handleDelete = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setStudents(students.filter(student => student !== selectedStudent));
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setUpdatedStudent({ ...student });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const confirmEdit = () => {
    setStudents(students.map((student) =>
      student === selectedStudent ? updatedStudent : student
    ));
    setShowEditModal(false);
  };

  const cancelEdit = () => {
    setShowEditModal(false);
  };

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
            <th>Status</th>
            <th>Fee Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <tr key={index}>
                <td>{student.name}</td>
                <td>{student.grade}</td>
                <td>
                  <span
                    className={`status-badge ${student.status === 'Active' ? 'status-active' : 'status-inactive'}`}
                  >
                    {student.status}
                  </span>
                </td>
                <td>
                  <span
                    className={`fee-status-badge ${student.feeStatus === 'Paid' ? 'fee-paid' : 'fee-pending'}`}
                  >
                    {student.feeStatus}
                  </span>
                </td>
                <td>
                  <FaEdit className="edit-icon" onClick={() => handleEdit(student)} />
                  <FaTrash className="delete-icon" onClick={() => handleDelete(student)} />
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="5">No students found.</td></tr>
          )}
        </tbody>
      </table>

      {showDeleteModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete {selectedStudent.name}?</h3>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={confirmDelete}>Confirm</button>
              <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Edit Student Information</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={updatedStudent.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Grade</label>
              <input
                type="text"
                name="grade"
                value={updatedStudent.grade}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <input
                type="text"
                name="status"
                value={updatedStudent.status}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Fee Status</label>
              <input
                type="text"
                name="feeStatus"
                value={updatedStudent.feeStatus}
                onChange={handleChange}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={confirmEdit}>Save</button>
              <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRecords;
