// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EduCertificateNFT is ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ASSISTANT_TEACHER_ROLE = keccak256("ASSISTANT_TEACHER_ROLE");

    struct CertificateData {
        string courseName;
        string studentName;
        string grade;
        string issuedDate;
        string templateURI;
        uint256 expirationDate;
        string institution;
    }

    mapping(uint256 => CertificateData) public certificateDetails;
    mapping(address => bool) public eligibleForDiscount;
    mapping(uint256 => bool) public certificateUsed;
    mapping(uint256 => Course) public courseCatalog;
    mapping(address => address) public referrals;
    mapping(address => uint256[]) public studentCourses;

    event CertificateMinted(address indexed student, uint256 indexed tokenId, string uri);
    event CertificateBurned(uint256 indexed tokenId);
    event CertificateRevoked(uint256 indexed tokenId, string reason);
    event CertificatePrintRequested(uint256 indexed tokenId, string orderID);
    event CertificateTransferRequested(uint256 indexed tokenId, address indexed from, address indexed to);
    event CertificateUsed(uint256 indexed tokenId);
    event CertificateVerified(uint256 indexed tokenId);

    struct Course {
        string name;
        string instructor;
        string description;
        uint256 courseFee;
    }

    constructor() ERC721("EduCertificate", "EDCERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function mintCertificate(
        address student,
        string memory tokenURI,
        string memory courseName,
        string memory studentName,
        string memory grade,
        string memory issuedDate,
        uint256 expirationDate,
        string memory templateURI,
        string memory institution
    ) internal returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _mint(student, tokenId);
        _setTokenURI(tokenId, tokenURI);

        certificateDetails[tokenId] = CertificateData({
            courseName: courseName,
            studentName: studentName,
            grade: grade,
            issuedDate: issuedDate,
            expirationDate: expirationDate,
            templateURI: templateURI,
            institution: institution
        });

        emit CertificateMinted(student, tokenId, tokenURI);
        return tokenId;
    }

    function mintCertificateWithDiscount(
        address student,
        string memory tokenURI,
        string memory courseName,
        string memory studentName,
        string memory grade,
        string memory issuedDate,
        uint256 expirationDate,
        string memory templateURI,
        string memory institution
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        require(eligibleForDiscount[student], "Student is not eligible for discount");
        return mintCertificate(student, tokenURI, courseName, studentName, grade, issuedDate, expirationDate, templateURI, institution);
    }

    function burnCertificate(uint256 tokenId) external onlyRole(MINTER_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);
        delete certificateDetails[tokenId];
        emit CertificateBurned(tokenId);
    }

    function revokeCertificate(uint256 tokenId, string memory reason) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);
        delete certificateDetails[tokenId];
        emit CertificateRevoked(tokenId, reason);
    }

    function requestCertificatePrint(uint256 tokenId, string memory orderID) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Certificate does not exist");
        emit CertificatePrintRequested(tokenId, orderID);
    }

    function verifyCertificate(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Certificate does not exist");
        return !isCertificateExpired(tokenId) && certificateDetails[tokenId].expirationDate > block.timestamp;
    }

    function isCertificateExpired(uint256 tokenId) public view returns (bool) {
        return certificateDetails[tokenId].expirationDate <= block.timestamp;
    }

    function markCertificateAsUsed(uint256 tokenId) external {
        require(_exists(tokenId), "Certificate does not exist");
        require(!certificateUsed[tokenId], "Certificate has already been used");

        certificateUsed[tokenId] = true;
        emit CertificateUsed(tokenId);
    }

    function isCertificateUsed(uint256 tokenId) external view returns (bool) {
        return certificateUsed[tokenId];
    }

    function transferCertificate(address to, uint256 tokenId) external {
        require(_exists(tokenId), "Certificate does not exist");
        require(!isCertificateExpired(tokenId), "Certificate is expired");

        _transfer(msg.sender, to, tokenId);
        emit CertificateTransferRequested(tokenId, msg.sender, to);
    }

    function setCustomMetadata(uint256 tokenId, string memory institution, string memory templateURI) external onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Certificate does not exist");
        certificateDetails[tokenId].templateURI = templateURI;
        certificateDetails[tokenId].institution = institution;
    }

    function setDiscountEligibility(address student, bool eligible) external onlyRole(ADMIN_ROLE) {
        eligibleForDiscount[student] = eligible;
    }

    function addCourse(uint256 courseId, string memory name, string memory instructor, string memory description, uint256 courseFee) external onlyRole(ADMIN_ROLE) {
        courseCatalog[courseId] = Course(name, instructor, description, courseFee);
    }

    function getCourseDetails(uint256 courseId) external view returns (Course memory) {
        return courseCatalog[courseId];
    }

    function setReferral(address referee, address referrer) external {
        require(referrals[referee] == address(0), "Referee already has a referrer");
        referrals[referee] = referrer;
    }

    function completeCourse(address student, uint256 courseId) external onlyRole(ASSISTANT_TEACHER_ROLE) {
        studentCourses[student].push(courseId);
        if (allCoursesCompleted(student)) {
            mintProgramCompletionCertificate(student);
        }
    }

    function allCoursesCompleted(address student) private view returns (bool) {
        return studentCourses[student].length == 5;
    }

    function mintProgramCompletionCertificate(address student) private {
        // Implementation depends on how you wish to distinguish this certificate
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
