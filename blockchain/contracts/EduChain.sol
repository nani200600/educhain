// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EduChain
 * @dev Decentralized Academic Credential Verification System
 */
contract EduChain is AccessControl, Pausable, ReentrancyGuard {

    bytes32 public constant ADMIN_ROLE       = keccak256("ADMIN_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    struct Credential {
        bytes32  credentialHash;
        address  institution;
        address  recipient;
        string   recipientName;
        string   degree;
        string   major;
        uint256  graduationYear;
        uint256  issuedAt;
        string   ipfsCID;
        bool     isRevoked;
        string   revocationReason;
    }

    struct Institution {
        string   name;
        string   country;
        string   website;
        bool     isActive;
        uint256  registeredAt;
        uint256  credentialCount;
    }

    mapping(bytes32 => Credential)   public credentials;
    mapping(address => Institution)  public institutions;
    mapping(address => bytes32[])    public recipientCredentials;
    mapping(address => bytes32[])    public institutionCredentials;

    uint256 public totalCredentials;
    uint256 public totalInstitutions;

    event InstitutionRegistered(address indexed institution, string name, uint256 timestamp);
    event InstitutionDeactivated(address indexed institution, uint256 timestamp);
    event CredentialIssued(bytes32 indexed credentialHash, address indexed institution, address indexed recipient, string degree, uint256 timestamp);
    event CredentialRevoked(bytes32 indexed credentialHash, string reason, uint256 timestamp);
    event CredentialVerified(bytes32 indexed credentialHash, address indexed verifier, uint256 timestamp);

    error InstitutionAlreadyRegistered(address institution);
    error InstitutionNotFound(address institution);
    error InstitutionNotActive(address institution);
    error CredentialAlreadyExists(bytes32 hash);
    error CredentialNotFound(bytes32 hash);
    error CredentialAlreadyRevoked(bytes32 hash);
    error UnauthorizedInstitution(address caller);
    error InvalidInput(string field);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    function registerInstitution(
        address institutionAddress,
        string calldata name,
        string calldata country,
        string calldata website
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (institutions[institutionAddress].registeredAt != 0)
            revert InstitutionAlreadyRegistered(institutionAddress);
        if (bytes(name).length == 0) revert InvalidInput("name");
        if (bytes(country).length == 0) revert InvalidInput("country");

        institutions[institutionAddress] = Institution({
            name: name,
            country: country,
            website: website,
            isActive: true,
            registeredAt: block.timestamp,
            credentialCount: 0
        });

        _grantRole(INSTITUTION_ROLE, institutionAddress);
        totalInstitutions++;

        emit InstitutionRegistered(institutionAddress, name, block.timestamp);
    }

    function deactivateInstitution(address institutionAddress)
        external onlyRole(ADMIN_ROLE)
    {
        if (institutions[institutionAddress].registeredAt == 0)
            revert InstitutionNotFound(institutionAddress);
        institutions[institutionAddress].isActive = false;
        _revokeRole(INSTITUTION_ROLE, institutionAddress);
        emit InstitutionDeactivated(institutionAddress, block.timestamp);
    }

    function issueCredential(
        address  recipient,
        string calldata recipientName,
        string calldata degree,
        string calldata major,
        uint256  graduationYear,
        string calldata ipfsCID
    ) external onlyRole(INSTITUTION_ROLE) whenNotPaused nonReentrant
      returns (bytes32 credentialHash)
    {
        if (!institutions[msg.sender].isActive) revert InstitutionNotActive(msg.sender);
        if (recipient == address(0)) revert InvalidInput("recipient");
        if (bytes(recipientName).length == 0) revert InvalidInput("recipientName");
        if (bytes(degree).length == 0) revert InvalidInput("degree");

        credentialHash = keccak256(abi.encodePacked(
            msg.sender, recipient, recipientName, degree, major, graduationYear, block.timestamp, block.number
        ));

        if (credentials[credentialHash].issuedAt != 0)
            revert CredentialAlreadyExists(credentialHash);

        credentials[credentialHash] = Credential({
            credentialHash:   credentialHash,
            institution:      msg.sender,
            recipient:        recipient,
            recipientName:    recipientName,
            degree:           degree,
            major:            major,
            graduationYear:   graduationYear,
            issuedAt:         block.timestamp,
            ipfsCID:          ipfsCID,
            isRevoked:        false,
            revocationReason: ""
        });

        recipientCredentials[recipient].push(credentialHash);
        institutionCredentials[msg.sender].push(credentialHash);
        institutions[msg.sender].credentialCount++;
        totalCredentials++;

        emit CredentialIssued(credentialHash, msg.sender, recipient, degree, block.timestamp);
    }

    function revokeCredential(bytes32 credentialHash, string calldata reason)
        external onlyRole(INSTITUTION_ROLE) whenNotPaused
    {
        Credential storage cred = credentials[credentialHash];
        if (cred.issuedAt == 0) revert CredentialNotFound(credentialHash);
        if (cred.institution != msg.sender) revert UnauthorizedInstitution(msg.sender);
        if (cred.isRevoked) revert CredentialAlreadyRevoked(credentialHash);

        cred.isRevoked = true;
        cred.revocationReason = reason;

        emit CredentialRevoked(credentialHash, reason, block.timestamp);
    }

    function verifyCredential(bytes32 credentialHash)
        external
        returns (Credential memory cred, bool isValid, string memory institutionName)
    {
        cred = credentials[credentialHash];
        if (cred.issuedAt == 0) revert CredentialNotFound(credentialHash);
        isValid = !cred.isRevoked;
        institutionName = institutions[cred.institution].name;
        emit CredentialVerified(credentialHash, msg.sender, block.timestamp);
    }

    function getRecipientCredentials(address recipient) external view returns (bytes32[] memory) {
        return recipientCredentials[recipient];
    }

    function getInstitutionCredentials(address institution) external view returns (bytes32[] memory) {
        return institutionCredentials[institution];
    }

    function getInstitution(address institutionAddress) external view returns (Institution memory) {
        return institutions[institutionAddress];
    }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }
}
