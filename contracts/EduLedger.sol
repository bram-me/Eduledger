// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

// EduLedger contract for school management
contract EduLedger is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _studentIdCounter;
    Counters.Counter private _courseIdCounter;
    Counters.Counter private _transactionIdCounter;

    struct Student {
        uint256 id;
        string name;
        string course;
        string grade;
        bool enrolled;
    }

    struct Course {
        uint256 id;
        string courseName;
        uint256 fee;
    }

    struct Payment {
        uint256 transactionId;
        uint256 studentId;
        uint256 amount;
        uint256 date;
    }

    mapping(uint256 => Student) public students;
    mapping(uint256 => Course) public courses;
    mapping(uint256 => Payment) public payments;

    event StudentRegistered(uint256 studentId, string name);
    event CourseRegistered(uint256 courseId, string courseName, uint256 fee);
    event PaymentMade(uint256 transactionId, uint256 studentId, uint256 amount);

    modifier onlyStudent(uint256 studentId) {
        require(students[studentId].enrolled, "Student not enrolled");
        _;
    }

    // Register a student
    function registerStudent(string memory name, string memory course) external {
        uint256 studentId = _studentIdCounter.current();
        _studentIdCounter.increment();

        students[studentId] = Student({
            id: studentId,
            name: name,
            course: course,
            grade: "",
            enrolled: true
        });

        emit StudentRegistered(studentId, name);
    }

    // Register a course
    function registerCourse(string memory courseName, uint256 fee) external onlyOwner {
        uint256 courseId = _courseIdCounter.current();
        _courseIdCounter.increment();

        courses[courseId] = Course({
            id: courseId,
            courseName: courseName,
            fee: fee
        });

        emit CourseRegistered(courseId, courseName, fee);
    }

    // Make payment for course
    function makePayment(uint256 studentId, uint256 amount) external onlyStudent(studentId) {
        uint256 transactionId = _transactionIdCounter.current();
        _transactionIdCounter.increment();

        Payment memory payment = Payment({
            transactionId: transactionId,
            studentId: studentId,
            amount: amount,
            date: block.timestamp
        });

        payments[transactionId] = payment;

        emit PaymentMade(transactionId, studentId, amount);
    }

    // Set grade for a student
    function setGrade(uint256 studentId, string memory grade) external onlyOwner {
        require(students[studentId].enrolled, "Student not found");
        students[studentId].grade = grade;
    }

    // Get student details
    function getStudent(uint256 studentId) external view returns (string memory name, string memory course, string memory grade) {
        require(students[studentId].enrolled, "Student not found");
        Student memory student = students[studentId];
        return (student.name, student.course, student.grade);
    }

    // Get course details
    function getCourse(uint256 courseId) external view returns (string memory courseName, uint256 fee) {
        require(courses[courseId].id != 0, "Course not found");
        Course memory course = courses[courseId];
        return (course.courseName, course.fee);
    }

    // Get payment details
    function getPayment(uint256 transactionId) external view returns (uint256 studentId, uint256 amount, uint256 date) {
        require(payments[transactionId].transactionId != 0, "Payment not found");
        Payment memory payment = payments[transactionId];
        return (payment.studentId, payment.amount, payment.date);
    }
}
