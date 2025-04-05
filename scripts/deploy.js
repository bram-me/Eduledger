// Importing necessary packages and contract artifacts
import { ethers } from "hardhat";
import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";  // Load env variables from .env

dotenv.config();  // Initialize dotenv

async function main() {
    // Load operator credentials from .env
    const operatorPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    const operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);

    // Set up Hedera client
    const client = Client.forTestnet(); // Switch to forMainnet() if needed
    client.setOperator(operatorAccountId, operatorPrivateKey);

    console.log("🚀 Deploying smart contracts to Hedera EVM...");

    // Deploy EduLedger contract
    const EduLedger = await ethers.getContractFactory("EduLedger");
    const eduLedger = await EduLedger.deploy();
    await eduLedger.deployed();
    console.log("✅ EduLedger deployed at:", eduLedger.address);

    // Deploy EduCertificateNFT contract
    const EduCertificateNFT = await ethers.getContractFactory("EduCertificateNFT");
    const eduCertificateNFT = await EduCertificateNFT.deploy();
    await eduCertificateNFT.deployed();
    console.log("✅ EduCertificateNFT deployed at:", eduCertificateNFT.address);

    // Link the NFT contract to the EduLedger contract
    try {
        console.log("🔗 Linking EduLedger with EduCertificateNFT...");
        const tx = await eduLedger.setNFTContractAddress(eduCertificateNFT.address); // assumes such function exists
        await tx.wait();
        console.log("✅ Linked successfully.");
    } catch (error) {
        console.error("❌ Error linking contracts:", error.message);
    }

    console.log("\n🎉 Deployment complete!");
    console.log(`📘 EduLedger Address: ${eduLedger.address}`);
    console.log(`📗 EduCertificateNFT Address: ${eduCertificateNFT.address}`);
}

// Run main
main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
