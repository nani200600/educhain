const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("EduChain", function () {
  async function deployFixture() {
    const [admin, institution1, institution2, student1, student2, stranger] = await ethers.getSigners();
    const EduChain = await ethers.getContractFactory("EduChain");
    const educhain = await EduChain.deploy();
    await educhain.registerInstitution(institution1.address, "Tsinghua University", "China", "https://tsinghua.edu.cn");
    return { educhain, admin, institution1, institution2, student1, student2, stranger };
  }

  async function issueAndGetHash(educhain, institution, student) {
    const tx = await educhain.connect(institution).issueCredential(
      student.address, "Test Student", "B.Sc. CS", "Computer Science", 2024, "QmTest"
    );
    const receipt = await tx.wait();
    const event = receipt.logs.map(l => { try { return educhain.interface.parseLog(l); } catch { return null; } }).find(e => e?.name === "CredentialIssued");
    return event.args.credentialHash;
  }

  describe("Institution Management", () => {
    it("registers institution correctly", async () => {
      const { educhain, institution1 } = await loadFixture(deployFixture);
      const inst = await educhain.getInstitution(institution1.address);
      expect(inst.name).to.equal("Tsinghua University");
      expect(inst.isActive).to.be.true;
    });

    it("rejects duplicate registration", async () => {
      const { educhain, institution1 } = await loadFixture(deployFixture);
      await expect(educhain.registerInstitution(institution1.address, "Dup", "CN", "https://dup.edu"))
        .to.be.revertedWithCustomError(educhain, "InstitutionAlreadyRegistered");
    });

    it("deactivates institution", async () => {
      const { educhain, institution1 } = await loadFixture(deployFixture);
      await educhain.deactivateInstitution(institution1.address);
      expect((await educhain.getInstitution(institution1.address)).isActive).to.be.false;
    });

    it("blocks non-admin from registering", async () => {
      const { educhain, stranger, institution2 } = await loadFixture(deployFixture);
      await expect(educhain.connect(stranger).registerInstitution(institution2.address, "Fake", "XX", "https://f.edu"))
        .to.be.reverted;
    });
  });

  describe("Credential Issuance", () => {
    it("issues credential and stores correctly", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      const hash = await issueAndGetHash(educhain, institution1, student1);
      const cred = await educhain.credentials(hash);
      expect(cred.recipientName).to.equal("Test Student");
      expect(cred.isRevoked).to.be.false;
    });

    it("increments totalCredentials", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      const before = await educhain.totalCredentials();
      await issueAndGetHash(educhain, institution1, student1);
      expect(await educhain.totalCredentials()).to.equal(before + 1n);
    });

    it("tracks recipient credentials", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      await issueAndGetHash(educhain, institution1, student1);
      await issueAndGetHash(educhain, institution1, student1);
      expect((await educhain.getRecipientCredentials(student1.address)).length).to.equal(2);
    });

    it("blocks inactive institution", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      await educhain.deactivateInstitution(institution1.address);
      await expect(educhain.connect(institution1).issueCredential(student1.address, "A", "B", "C", 2024, ""))
        .to.be.reverted;
    });
  });

  describe("Revocation", () => {
    it("revokes credential", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      const hash = await issueAndGetHash(educhain, institution1, student1);
      await educhain.connect(institution1).revokeCredential(hash, "Fraud");
      expect((await educhain.credentials(hash)).isRevoked).to.be.true;
    });

    it("blocks another institution from revoking", async () => {
      const { educhain, institution1, institution2, student1 } = await loadFixture(deployFixture);
      await educhain.registerInstitution(institution2.address, "PKU", "China", "https://pku.edu.cn");
      const hash = await issueAndGetHash(educhain, institution1, student1);
      await expect(educhain.connect(institution2).revokeCredential(hash, "Bad"))
        .to.be.revertedWithCustomError(educhain, "UnauthorizedInstitution");
    });

    it("blocks double revocation", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      const hash = await issueAndGetHash(educhain, institution1, student1);
      await educhain.connect(institution1).revokeCredential(hash, "First");
      await expect(educhain.connect(institution1).revokeCredential(hash, "Second"))
        .to.be.revertedWithCustomError(educhain, "CredentialAlreadyRevoked");
    });
  });

  describe("Verification", () => {
    it("returns valid for active credential", async () => {
      const { educhain, institution1, student1, stranger } = await loadFixture(deployFixture);
      const hash = await issueAndGetHash(educhain, institution1, student1);
      const result = await educhain.connect(stranger).verifyCredential.staticCall(hash);
      expect(result.isValid).to.be.true;
      expect(result.institutionName).to.equal("Tsinghua University");
    });

    it("returns invalid for revoked credential", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      const hash = await issueAndGetHash(educhain, institution1, student1);
      await educhain.connect(institution1).revokeCredential(hash, "Fraud");
      const result = await educhain.verifyCredential.staticCall(hash);
      expect(result.isValid).to.be.false;
    });
  });

  describe("Admin Controls", () => {
    it("pauses and unpauses", async () => {
      const { educhain, institution1, student1 } = await loadFixture(deployFixture);
      await educhain.pause();
      await expect(educhain.connect(institution1).issueCredential(student1.address, "S", "D", "M", 2024, ""))
        .to.be.revertedWithCustomError(educhain, "EnforcedPause");
      await educhain.unpause();
      await expect(issueAndGetHash(educhain, institution1, student1)).to.not.be.rejected;
    });
  });
});
