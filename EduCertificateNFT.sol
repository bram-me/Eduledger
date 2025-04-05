// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract EduCertificateNFT is ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public tokenCounter;

    struct CertificateData {
        string courseName;
        string studentName;
        string grade;
        string issuedDate;
    }

    mapping(uint256 => CertificateData) public certificateDetails;

    event CertificateMinted(address indexed student, uint256 indexed tokenId, string uri);
    event CertificateBurned(uint256 indexed tokenId);

    constructor() ERC721("EduCertificate", "EDCERT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function mintCertificate(
        address student,
        string memory tokenURI,
        string memory courseName,
        string memory studentName,
        string memory grade,
        string memory issuedDate
    ) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = ++tokenCounter;
        _mint(student, tokenId);
        _setTokenURI(tokenId, tokenURI);

        certificateDetails[tokenId] = CertificateData({
            courseName: courseName,
            studentName: studentName,
            grade: grade,
            issuedDate: issuedDate
        });

        emit CertificateMinted(student, tokenId, tokenURI);
        return tokenId;
    }

    function burnCertificate(uint256 tokenId) external onlyRole(MINTER_ROLE) {
        _burn(tokenId);
        delete certificateDetails[tokenId];
        emit CertificateBurned(tokenId);
    }

    function grantMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }

    function revokeMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, minter);
    }

    function getCertificateData(uint256 tokenId) external view returns (CertificateData memory) {
        require(_exists(tokenId), "Token does not exist");
        return certificateDetails[tokenId];
    }
}
