const { ethers, network, run } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying EduChain to", network.name, "...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📦 Deploying with account:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  const EduChain = await ethers.getContractFactory("EduChain");
  const educhain = await EduChain.deploy();
  await educhain.waitForDeployment();

  const address = await educhain.getAddress();
  console.log("✅ EduChain deployed to:", address);
  console.log("🔗 Transaction hash:", educhain.deploymentTransaction().hash);

  const deployDir = "./deployments";
  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir);
  fs.writeFileSync(`${deployDir}/${network.name}.json`, JSON.stringify({
    network: network.name,
    contractAddress: address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    transactionHash: educhain.deploymentTransaction().hash,
  }, null, 2));
  console.log(`\n📄 Saved to deployments/${network.name}.json`);

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n⏳ Waiting 5 confirmations before verifying...");
    await educhain.deploymentTransaction().wait(5);
    try {
      await run("verify:verify", { address, constructorArguments: [] });
      console.log("✅ Verified on Etherscan!");
    } catch (err) {
      console.log(err.message.includes("already verified") ? "✅ Already verified!" : "❌ " + err.message);
    }
  }

  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("\n🏫 Registering demo institution...");
    await (await educhain.registerInstitution(deployer.address, "Demo University", "India", "https://demo.edu")).wait();
    console.log("✅ Demo institution registered:", deployer.address);
  }

  console.log("\n🎉 Done! Contract:", address);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
