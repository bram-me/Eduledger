// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

interface IEduCertificateNFT {
    function mintCertificate(address to, string memory uri) external returns (uint256);
}

contract EduLedger is AccessControl {
    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TEACHER_ROLE = keccak256("TEACHER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");
    bytes32 public constant COURSE_MANAGER_ROLE = keccak256("COURSE_MANAGER_ROLE");

    struct Course {
        string title;
        string description;
        address teacher;
        uint256 feeHBAR;
        uint256 feeToken;
        bool exists;
        bool active;
        uint256 createdAt;
        uint256 lastUpdated;
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
    mapping(uint256 => EnumerableSet.AddressSet) private courseStudents;
    mapping(address => mapping(uint256 => Record)) public studentRecords;
    mapping(uint256 => mapping(address => bool)) public isStudentEnrolled;
    mapping(uint256 => uint256) public feeAdjustmentRates;

    event CourseCreated(uint256 indexed courseId, string title);
    event CourseUpdated(uint256 indexed courseId, string title, bool active, uint256 feeHBAR, uint256 feeToken);
    event StudentEnrolled(address indexed student, uint256 indexed courseId);
    event PaymentReceived(address indexed student, uint256 indexed courseId, uint256 amount, string paymentType);
    event CourseCompleted(address indexed student, uint256 indexed courseId);
    event CertificateIssued(address indexed student, uint256 indexed courseId);
    event CertificateRevoked(address indexed student, uint256 indexed courseId);
    event CourseFeeAdjusted(uint256 indexed courseId, uint256 newFeeHBAR, uint256 newFeeToken);

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
        courses[courseId] = Course({
            title: _title,
            description: _description,
            teacher: msg.sender,
            feeHBAR: _feeHBAR,
            feeToken: _feeToken,
            exists: true,
            active: true,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        emit CourseCreated(courseId, _title);
    }

    function toggleCourseStatus(uint256 courseId, bool active) external onlyTeacherOf(courseId) {
        courses[courseId].active = active;
        courses[courseId].lastUpdated = block.timestamp;
        emit CourseUpdated(courseId, courses[courseId].title, active, courses[courseId].feeHBAR, courses[courseId].feeToken);
    }

    function enrollHBAR(uint256 courseId) external payable onlyRole(STUDENT_ROLE) {
        Course storage course = courses[courseId];
        require(course.exists && course.active, "Inactive or nonexistent course");
        require(!isStudentEnrolled[courseId][msg.sender], "Already enrolled");
        require(msg.value >= course.feeHBAR, "Insufficient HBAR");

        courseStudents[courseId].add(msg.sender);
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
        courseStudents[courseId].add(msg.sender);
        isStudentEnrolled[courseId][msg.sender] = true;

        emit StudentEnrolled(msg.sender, courseId);
        emit PaymentReceived(msg.sender, courseId, course.feeToken, "TOKEN");
    }

    function addRecord(uint256 courseId, address student, string memory grade, string memory note) external onlyTeacherOf(courseId) {
        require(isStudentEnrolled[courseId][student], "Student not enrolled");
        Record storage record = studentRecords[student][courseId];
        record.grade = grade;
        record.note = note;
        emit CourseUpdated(courseId, courses[courseId].title, courses[courseId].active, courses[courseId].feeHBAR, courses[courseId].feeToken);
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

    function setFeeAdjustment(uint256 courseId, uint256 newFeeHBAR, uint256 newFeeToken) external onlyRole(ADMIN_ROLE) {
        courses[courseId].feeHBAR = newFeeHBAR;
        courses[courseId].feeToken = newFeeToken;
        feeAdjustmentRates[courseId] = block.timestamp;
        emit CourseFeeAdjusted(courseId, newFeeHBAR, newFeeToken);
    }

    function getStudents(uint256 courseId) external view returns (address[] memory) {
        return courseStudents[courseId].values();
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

    function grantCourseManager(address manager) external onlyRole(ADMIN_ROLE) {
        _grantRole(COURSE_MANAGER_ROLE, manager);
    }
}
