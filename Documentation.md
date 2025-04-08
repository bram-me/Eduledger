# EduLedger Contract Documentation

## Overview
The EduLedger contract is designed to manage the lifecycle of courses, students, payments, and certifications in an educational ecosystem. It enables course creation, enrollment, fee payments, student record management, and certificate issuance. This contract integrates with an ERC-20 token for fee payment and an NFT-based certificate system (ERC-721).

## Key Features
- **Course Management**: Teachers can create and manage courses, including enrollment fees (both HBAR and tokens).
- **Student Enrollment**: Students can enroll in courses by paying fees in HBAR or tokens.
- **Course Completion & Certification**: Teachers can mark courses as completed for students, and issue or revoke certificates.
- **Dynamic Fee Adjustment**: Admins can adjust course fees dynamically to account for inflation or other factors.
- **Role-based Access Control**: Different roles (Admin, Teacher, Student, Course Manager) are defined to control access to various functionalities.

## Contract Structure

### State Variables
- **`eduToken`**: The ERC-20 token used for course fee payments.
- **`certificateNFT`**: The contract responsible for minting certificates for completed courses (ERC-721).
- **`feeCollector`**: The address that collects the fee payments.
- **`courseCounter`**: A counter to assign unique IDs to new courses.
- **`courses`**: A mapping of course IDs to `Course` structs.
- **`courseStudents`**: A mapping of course IDs to sets of enrolled students.
- **`studentRecords`**: A mapping of student addresses to their records for each course.
- **`isStudentEnrolled`**: A mapping of course IDs to student enrollment status.
- **`feeAdjustmentRates`**: A mapping to track dynamic fee adjustments for courses.

### Structs

#### `Course`
- **`title`**: The title of the course.
- **`description`**: A description of the course.
- **`teacher`**: The address of the teacher managing the course.
- **`feeHBAR`**: The fee to enroll in the course, paid in HBAR.
- **`feeToken`**: The fee to enroll in the course, paid in tokens.
- **`exists`**: A flag indicating whether the course exists.
- **`active`**: A flag indicating whether the course is currently active.
- **`createdAt`**: The timestamp when the course was created.
- **`lastUpdated`**: The timestamp when the course was last updated.

#### `Record`
- **`grade`**: The grade awarded to the student.
- **`note`**: Additional notes related to the student's performance.
- **`completed`**: A flag indicating whether the course has been completed by the student.
- **`certified`**: A flag indicating whether the student has been issued a certificate.

## Functions

### 1. `createCourse`
- **Description**: Creates a new course with a title, description, HBAR fee, and token fee.
- **Parameters**:
  - `_title`: The title of the course.
  - `_description`: The description of the course.
  - `_feeHBAR`: The enrollment fee in HBAR.
  - `_feeToken`: The enrollment fee in tokens.
- **Access Control**: Only users with the `TEACHER_ROLE` can create courses.

### 2. `toggleCourseStatus`
- **Description**: Activates or deactivates a course.
- **Parameters**:
  - `courseId`: The ID of the course.
  - `active`: A boolean indicating whether the course should be active.
- **Access Control**: Only the teacher of the course can toggle its status.

### 3. `enrollHBAR`
- **Description**: Allows a student to enroll in a course by paying the enrollment fee in HBAR.
- **Parameters**:
  - `courseId`: The ID of the course.
- **Access Control**: Only users with the `STUDENT_ROLE` can enroll.
- **Events Emitted**:
  - `StudentEnrolled`
  - `PaymentReceived`

### 4. `enrollToken`
- **Description**: Allows a student to enroll in a course by paying the enrollment fee in tokens (ERC-20).
- **Parameters**:
  - `courseId`: The ID of the course.
- **Access Control**: Only users with the `STUDENT_ROLE` can enroll.
- **Events Emitted**:
  - `StudentEnrolled`
  - `PaymentReceived`

### 5. `addRecord`
- **Description**: Adds a grade and note for a student in a course.
- **Parameters**:
  - `courseId`: The ID of the course.
  - `student`: The address of the student.
  - `grade`: The grade awarded to the student.
  - `note`: Additional notes regarding the student's performance.
- **Access Control**: Only the teacher of the course can add records.

### 6. `markCourseCompleted`
- **Description**: Marks a student's course as completed and mints a certificate (NFT) if not already certified.
- **Parameters**:
  - `courseId`: The ID of the course.
  - `student`: The address of the student.
  - `certURI`: The URI of the certificate.
- **Access Control**: Only the teacher of the course can mark the course as completed.
- **Events Emitted**:
  - `CourseCompleted`
  - `CertificateIssued`

### 7. `revokeCertificate`
- **Description**: Revokes a certificate for a student in a course.
- **Parameters**:
  - `courseId`: The ID of the course.
  - `student`: The address of the student.
- **Access Control**: Only the teacher of the course can revoke certificates.
- **Events Emitted**: `CertificateRevoked`

### 8. `setFeeAdjustment`
- **Description**: Allows the admin to adjust the enrollment fees for a course.
- **Parameters**:
  - `courseId`: The ID of the course.
  - `newFeeHBAR`: The new fee in HBAR.
  - `newFeeToken`: The new fee in tokens.
- **Access Control**: Only users with the `ADMIN_ROLE` can adjust fees.
- **Events Emitted**: `CourseFeeAdjusted`

### 9. `getStudents`
- **Description**: Returns the list of students enrolled in a course.
- **Parameters**:
  - `courseId`: The ID of the course.
- **Returns**: An array of student addresses.

### 10. `setFeeCollector`
- **Description**: Sets the address where collected fees are sent.
- **Parameters**:
  - `_collector`: The address of the fee collector.
- **Access Control**: Only users with the `ADMIN_ROLE` can set the fee collector.

### 11. `withdrawHBAR`
- **Description**: Allows the admin to withdraw all accumulated HBAR.
- **Access Control**: Only users with the `ADMIN_ROLE` can withdraw HBAR.

### 12. `withdrawToken`
- **Description**: Allows the admin to withdraw all accumulated tokens.
- **Access Control**: Only users with the `ADMIN_ROLE` can withdraw tokens.

### 13. `grantStudent`
- **Description**: Grants the `STUDENT_ROLE` to a user.
- **Parameters**:
  - `student`: The address of the student.
- **Access Control**: Only users with the `ADMIN_ROLE` can grant the `STUDENT_ROLE`.

### 14. `grantTeacher`
- **Description**: Grants the `TEACHER_ROLE` to a user.
- **Parameters**:
  - `teacher`: The address of the teacher.
- **Access Control**: Only users with the `ADMIN_ROLE` can grant the `TEACHER_ROLE`.

### 15. `grantCourseManager`
- **Description**: Grants the `COURSE_MANAGER_ROLE` to a user.
- **Parameters**:
  - `manager`: The address of the course manager.
- **Access Control**: Only users with the `ADMIN_ROLE` can grant the `COURSE_MANAGER_ROLE`.

## Access Control
- **`DEFAULT_ADMIN_ROLE`**: The highest authority role, typically for contract owners or administrators.
- **`ADMIN_ROLE`**: Grants access to admin functions like adjusting fees and setting the fee collector.
- **`TEACHER_ROLE`**: Grants access to manage courses, enroll students, and mark courses as completed.
- **`STUDENT_ROLE`**: Grants access to enroll in courses and view certificates.
- **`COURSE_MANAGER_ROLE`**: Allows for additional management of courses (optional, based on use case).

## Security Considerations
- **Reentrancy Attacks**: The contract uses the `transfer()` method to send funds, which is safe from reentrancy attacks. However, it is recommended to consider reentrancy guard mechanisms in complex implementations.
- **Access Control**: Proper access control is implemented using the `AccessControl` contract from OpenZeppelin, ensuring only authorized users can perform sensitive actions.
- **Gas Optimization**: Using `EnumerableSet` to track enrolled students ensures efficient operations in terms of gas and storage.




# EduCertificateNFT Smart Contract Documentation

## Overview

The `EduCertificateNFT` contract allows for the creation, management, and verification of educational certificates in the form of Non-Fungible Tokens (NFTs) on the blockchain. This contract incorporates roles for minting, burning, and transferring certificates, as well as providing transparency and traceability through metadata and certificate management functionalities. The contract also supports certificate revocation, transfers, custom metadata, discounts, referrals, and course completion tracking.

---

## Key Features

1. **Minting Certificates**: Educational certificates are minted as ERC-721 tokens and can be issued to students with metadata describing the course, student, grade, and expiration date.
   
2. **Revocation of Certificates**: Admins can revoke certificates, providing transparency with a revocation reason.

3. **Certificate Verification**: Publicly verifiable certificates with information about their validity and usage status.

4. **Certificate Transferability**: Certificates can be transferred between addresses while ensuring they are valid and not expired.

5. **Custom Metadata**: Admins can modify metadata like institution names, validity periods, and template URIs after minting.

6. **Discount Mechanism**: Students can receive discounts on certificates if they meet specific criteria.

7. **Referral Program**: Students can refer others, and referrers can receive rewards.

8. **Program Completion**: Allows for the issuance of a "Program Completion Certificate" once a student has completed all required courses.

9. **Course Catalog**: A listing of available courses with descriptions, instructor details, and course fees.

---

## Functions

### **1. mintCertificate**

**Function**: `mintCertificate(address student, string memory tokenURI, string memory courseName, string memory studentName, string memory grade, string memory issuedDate, uint256 expirationDate, string memory templateURI)`

**Description**: Mints a new certificate for a student with course details, expiration date, and template URI. This function is only callable by addresses with the `MINTER_ROLE`.

**Parameters**:
- `student`: Address of the student to receive the certificate.
- `tokenURI`: Metadata URI pointing to the certificate's information.
- `courseName`: Name of the course.
- `studentName`: Name of the student.
- `grade`: Grade received by the student.
- `issuedDate`: Date the certificate was issued.
- `expirationDate`: Expiration date of the certificate.
- `templateURI`: Custom template URI for the certificate.

**Returns**: The token ID of the minted certificate.

---

### **2. revokeCertificate**

**Function**: `revokeCertificate(uint256 tokenId, string memory reason)`

**Description**: Revokes an existing certificate, preventing further use. This function is only callable by addresses with the `ADMIN_ROLE`.

**Parameters**:
- `tokenId`: The token ID of the certificate to revoke.
- `reason`: A string explaining the reason for revocation.

---

### **3. verifyCertificate**

**Function**: `verifyCertificate(uint256 tokenId) public view returns (bool)`

**Description**: Verifies the validity of a certificate. It checks if the certificate is expired or revoked.

**Parameters**:
- `tokenId`: The token ID of the certificate.

**Returns**: `true` if the certificate is valid and not expired, `false` otherwise.

---

### **4. transferCertificate**

**Function**: `transferCertificate(address to, uint256 tokenId)`

**Description**: Transfers a certificate to a new address, ensuring the certificate is valid and not expired.

**Parameters**:
- `to`: The address to transfer the certificate to.
- `tokenId`: The token ID of the certificate.

---

### **5. markCertificateAsUsed**

**Function**: `markCertificateAsUsed(uint256 tokenId) external`

**Description**: Marks a certificate as used, indicating that it has been verified or checked.

**Parameters**:
- `tokenId`: The token ID of the certificate.

---

### **6. setCustomMetadata**

**Function**: `setCustomMetadata(uint256 tokenId, string memory institution, uint256 validityPeriod, string memory templateURI)`

**Description**: Allows an admin to set custom metadata for a specific certificate, including institution details, validity period, and template URI.

**Parameters**:
- `tokenId`: The token ID of the certificate to modify.
- `institution`: Name of the issuing institution.
- `validityPeriod`: The validity period of the certificate in days.
- `templateURI`: URI for the custom template.

---

### **7. setDiscountEligibility**

**Function**: `setDiscountEligibility(address student, bool eligible)`

**Description**: Allows the admin to set whether a student is eligible for discounts on certificate issuance.

**Parameters**:
- `student`: The address of the student.
- `eligible`: `true` if the student is eligible for a discount, `false` otherwise.

---

### **8. mintCertificateWithDiscount**

**Function**: `mintCertificateWithDiscount(address student, string memory tokenURI, string memory courseName, string memory studentName, string memory grade, string memory issuedDate, uint256 expirationDate, string memory templateURI, uint256 discountPercentage)`

**Description**: Mints a certificate with a discount applied, if the student is eligible for a discount. This function uses the discount eligibility set by the admin.

**Parameters**:
- `student`: Address of the student.
- `tokenURI`: Metadata URI.
- `courseName`: Course name.
- `studentName`: Student's name.
- `grade`: Student's grade.
- `issuedDate`: Date the certificate was issued.
- `expirationDate`: Expiration date.
- `templateURI`: Template URI.
- `discountPercentage`: The discount percentage to apply.

---

### **9. addCourse**

**Function**: `addCourse(uint256 courseId, string memory name, string memory instructor, string memory description, uint256 courseFee)`

**Description**: Adds a new course to the course catalog. This function can only be called by addresses with the `ADMIN_ROLE`.

**Parameters**:
- `courseId`: Unique ID of the course.
- `name`: Name of the course.
- `instructor`: Instructor of the course.
- `description`: Course description.
- `courseFee`: The fee for the course.

---

### **10. getCourseDetails**

**Function**: `getCourseDetails(uint256 courseId) external view returns (Course memory)`

**Description**: Returns the details of a course from the catalog.

**Parameters**:
- `courseId`: The unique ID of the course.

**Returns**: The course details (name, instructor, description, course fee).

---

### **11. setReferral**

**Function**: `setReferral(address referee, address referrer)`

**Description**: Allows a student to refer another student. The referrer will be tracked, and rewards or discounts can be applied.

**Parameters**:
- `referee`: The student being referred.
- `referrer`: The student who is making the referral.

---

### **12. completeCourse**

**Function**: `completeCourse(address student, uint256 courseId)`

**Description**: Marks a student as having completed a course. Once all required courses are completed, the student will receive a program completion certificate. This function is callable by addresses with the `ASSISTANT_TEACHER_ROLE`.

**Parameters**:
- `student`: The address of the student.
- `courseId`: The ID of the course completed.

---

## Roles

- **MINTER_ROLE**: Allows minting of certificates.
- **ADMIN_ROLE**: Allows administrative actions, such as revoking certificates, setting metadata, adding courses, etc.
- **ASSISTANT_TEACHER_ROLE**: Allows marking courses as completed for students and helps track their progress.

---

## Events

- **CertificateMinted**: Emitted when a certificate is minted.
- **CertificateBurned**: Emitted when a certificate is burned.
- **CertificateRevoked**: Emitted when a certificate is revoked with a reason.
- **CertificatePrintRequested**: Emitted when a print request for a certificate is made.
- **CertificateTransferRequested**: Emitted when a certificate is transferred.
- **CertificateUsed**: Emitted when a certificate is used (verified or checked).
- **CertificateVerified**: Emitted when a certificate's validity is verified.

