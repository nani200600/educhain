/**
 * Blockchain Event Sync
 * Listens to EduChain contract events and caches them in MongoDB
 * Run this continuously in the background
 */
const { getContract } = require("./blockchain");
const Credential  = require("../models/Credential");
const Institution = require("../models/Institution");

let isSyncing = false;

/**
 * Start listening to live events
 */
function startEventSync() {
  const contract = getContract();
  console.log("📡 Starting blockchain event sync...");

  // CredentialIssued
  contract.on("CredentialIssued", async (credentialHash, institution, recipient, degree, timestamp, event) => {
    try {
      const cred = await contract.credentials(credentialHash);
      await Credential.findOneAndUpdate(
        { credentialHash },
        {
          credentialHash,
          institution:   institution.toLowerCase(),
          recipient:     recipient.toLowerCase(),
          recipientName: cred.recipientName,
          degree:        cred.degree,
          major:         cred.major,
          graduationYear: Number(cred.graduationYear),
          issuedAt:      Number(cred.issuedAt),
          ipfsCID:       cred.ipfsCID,
          isRevoked:     false,
          txHash:        event.log?.transactionHash,
          blockNumber:   event.log?.blockNumber,
          syncedAt:      new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Synced credential: ${credentialHash.slice(0, 12)}...`);
    } catch (err) {
      console.error("❌ Error syncing CredentialIssued:", err.message);
    }
  });

  // CredentialRevoked
  contract.on("CredentialRevoked", async (credentialHash, reason) => {
    try {
      await Credential.findOneAndUpdate(
        { credentialHash },
        { isRevoked: true, revocationReason: reason, syncedAt: new Date() }
      );
      console.log(`🚫 Revoked credential: ${credentialHash.slice(0, 12)}...`);
    } catch (err) {
      console.error("❌ Error syncing CredentialRevoked:", err.message);
    }
  });

  // InstitutionRegistered
  contract.on("InstitutionRegistered", async (institutionAddress, name, timestamp, event) => {
    try {
      const inst = await contract.getInstitution(institutionAddress);
      await Institution.findOneAndUpdate(
        { address: institutionAddress.toLowerCase() },
        {
          address:      institutionAddress.toLowerCase(),
          name:         inst.name,
          country:      inst.country,
          website:      inst.website,
          isActive:     true,
          registeredAt: Number(inst.registeredAt),
          txHash:       event.log?.transactionHash,
          syncedAt:     new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`🏫 Synced institution: ${name}`);
    } catch (err) {
      console.error("❌ Error syncing InstitutionRegistered:", err.message);
    }
  });

  console.log("✅ Event listeners active.");
}

/**
 * One-time historical sync from block 0 to now
 * Run this once on first startup to backfill MongoDB
 */
async function syncHistoricalEvents(fromBlock = 0) {
  if (isSyncing) { console.log("⏳ Already syncing..."); return; }
  isSyncing = true;
  console.log(`🔄 Syncing historical events from block ${fromBlock}...`);

  try {
    const contract = getContract();

    // Sync all CredentialIssued events
    const issuedEvents = await contract.queryFilter(contract.filters.CredentialIssued(), fromBlock);
    console.log(`  Found ${issuedEvents.length} CredentialIssued events`);

    for (const event of issuedEvents) {
      const { credentialHash, institution, recipient, degree } = event.args;
      try {
        const cred = await contract.credentials(credentialHash);
        await Credential.findOneAndUpdate(
          { credentialHash },
          {
            credentialHash,
            institution:    institution.toLowerCase(),
            recipient:      recipient.toLowerCase(),
            recipientName:  cred.recipientName,
            degree:         cred.degree,
            major:          cred.major,
            graduationYear: Number(cred.graduationYear),
            issuedAt:       Number(cred.issuedAt),
            ipfsCID:        cred.ipfsCID,
            isRevoked:      false,
            txHash:         event.transactionHash,
            blockNumber:    event.blockNumber,
            syncedAt:       new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.error(`  ⚠ Failed to sync ${credentialHash}: ${err.message}`);
      }
    }

    // Sync all CredentialRevoked events
    const revokedEvents = await contract.queryFilter(contract.filters.CredentialRevoked(), fromBlock);
    for (const event of revokedEvents) {
      const { credentialHash, reason } = event.args;
      await Credential.findOneAndUpdate({ credentialHash }, { isRevoked: true, revocationReason: reason }).catch(() => {});
    }

    console.log(`✅ Historical sync complete. ${issuedEvents.length} credentials indexed.`);
  } catch (err) {
    console.error("❌ Historical sync failed:", err.message);
  } finally {
    isSyncing = false;
  }
}

module.exports = { startEventSync, syncHistoricalEvents };
