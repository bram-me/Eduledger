// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IEduCertificateNFT {
    function mintCertificate(address to, string memory uri) external returns (uint256);
}

contract EduLedger is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    struct Course {
        string title;
        string description;
        address teacher;
        uint256 feeHBAR;
        uint256 feeToken;
        bool exists;
        bool active;
    }

    struct Record {
        string grade;
        string note;
        bool completed;
        bool certified;
    }

    IERC20 public eduToken;
    IEduCertificateNFT public certificateNFT;
    address public feeCollector;

    uint256 public courseCounter;
    mapping(uint256 => Course) public courses;
    mapping(uint256 => address[]) public courseStudents;
    mapping(address => mapping(uint256 => Record)) public studentRecords;
    mapping(uint256 => mapping(address => bool)) public isStudentEnrolled;

    event CourseCreated(uint256 indexed courseId, string title);
    event CourseUpdated(uint256 indexed courseId, bool active);
    event StudentEnrolled(address indexed student, uint256 indexed courseId);
    event PaymentReceived(address indexed student, uint256 indexed courseId, uint256 amount, string paymentType);
    event CourseCompleted(address indexed student, uint256 indexed courseId);
    event CertificateIssued(address indexed student, uint256 indexed courseId);
    event CertificateRevoked(address indexed student, uint256 indexed courseId);

    constructor(address _eduToken, address _nft, address _feeCollector) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        eduToken = IERC20(_eduToken);
        certificateNFT = IEduCertificateNFT(_nft);
        feeCollector = _feeCollector;
    }

    modifier onlyTeacherOf(uint256 courseId) {
        require(courses[courseId].exists, "Course does not exist");
        require(courses[courseId].teacher == msg.sender, "Not authorized");
        _;
    }

    function createCourse(string memory _title, string memory _description, uint256 _feeHBAR, uint256 _feeToken) external onlyRole(TEACHER_ROLE) {
        uint256 courseId = ++courseCounter;
        courses[courseId] = Course(_title, _description, msg.sender, _feeHBAR, _feeToken, true, true);
        emit CourseCreated(courseId, _title);
    }

    function toggleCourseStatus(uint256 courseId, bool active) external onlyTeacherOf(courseId) {
        courses[courseId].active = active;
        emit CourseUpdated(courseId, active);
    }

    function enrollHBAR(uint256 courseId) external payable onlyRole(STUDENT_ROLE) {
        Course storage course = courses[courseId];
        require(course.exists && course.active, "Inactive or nonexistent course");
        require(!isStudentEnrolled[courseId][msg.sender], "Already enrolled");
        require(msg.value >= course.feeHBAR, "Insufficient HBAR");

        courseStudents[courseId].push(msg.sender);
        isStudentEnrolled[courseId][msg.sender] = true;

        emit StudentEnrolled(msg.sender, courseId);
        emit PaymentReceived(msg.sender, courseId, msg.value, "HBAR");
        payable(feeCollector).transfer(msg.value);
    }

    function enrollToken(uint256 courseId) external onlyRole(STUDENT_ROLE) {
        Course storage course = courses[courseId];
        require(course.exists && course.active, "Inactive or nonexistent course");
        require(!isStudentEnrolled[courseId][msg.sender], "Already enrolled");

        require(eduToken.transferFrom(msg.sender, feeCollector, course.feeToken), "Token transfer failed");
        courseStudents[courseId].push(msg.sender);
        isStudentEnrolled[courseId][msg.sender] = true;

        emit StudentEnrolled(msg.sender, courseId);
        emit PaymentReceived(msg.sender, courseId, course.feeToken, "TOKEN");
    }

    function addRecord(uint256 courseId, address student, string memory grade, string memory note) external onlyTeacherOf(courseId) {
        require(isStudentEnrolled[courseId][student], "Student not enrolled");
        Record storage record = studentRecords[student][courseId];
        record.grade = grade;
        record.note = note;
    }

    function markCourseCompleted(uint256 courseId, address student, string memory certURI) external onlyTeacherOf(courseId) {
        require(isStudentEnrolled[courseId][student], "Not enrolled");
        Record storage record = studentRecords[student][courseId];
        require(!record.completed, "Already marked");

        record.completed = true;
        emit CourseCompleted(student, courseId);

        if (!record.certified) {
            certificateNFT.mintCertificate(student, certURI);
            record.certified = true;
            emit CertificateIssued(student, courseId);
        }
    }

    function revokeCertificate(uint256 courseId, address student) external onlyTeacherOf(courseId) {
        Record storage record = studentRecords[student][courseId];
        require(record.certified, "No certificate to revoke");
        record.certified = false;
        emit CertificateRevoked(student, courseId);
    }

    function getStudents(uint256 courseId) external view returns (address[] memory) {
        return courseStudents[courseId];
    }

    function setFeeCollector(address _collector) external onlyRole(ADMIN_ROLE) {
        feeCollector = _collector;
    }

    function withdrawHBAR() external onlyRole(ADMIN_ROLE) {
        payable(feeCollector).transfer(address(this).balance);
    }

    function withdrawToken() external onlyRole(ADMIN_ROLE) {
        uint256 balance = eduToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(eduToken.transfer(feeCollector, balance), "Transfer failed");
    }

    function grantStudent(address student) external onlyRole(ADMIN_ROLE) {
        _grantRole(STUDENT_ROLE, student);
    }

    function grantTeacher(address teacher) external onlyRole(ADMIN_ROLE) {
        _grantRole(TEACHER_ROLE, teacher);
    }
}
