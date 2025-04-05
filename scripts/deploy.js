import pkg from "hardhat";
import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";  // Load env variables from .env

dotenv.config();  // Initialize dotenv to load .env

const { ethers } = pkg;  // Destructure ethers from the default import

async function main() {
    // Ensure the environment variables are loaded properly (with VITE_ prefix)
    const operatorPrivateKey = process.env.VITE_HEDERA_PRIVATE_KEY;
    const operatorAccountId = process.env.VITE_HEDERA_ACCOUNT_ID;

    if (!operatorPrivateKey || !operatorAccountId) {
        console.error("❌ Please make sure VITE_HEDERA_PRIVATE_KEY and VITE_HEDERA_ACCOUNT_ID are set in your .env file.");
        return;
    }

    // Initialize Hedera client with the private key and account ID
    const privateKey = PrivateKey.fromString(operatorPrivateKey);
    const accountId = AccountId.fromString(operatorAccountId);

    const client = Client.forTestnet();  // Use Client.forMainnet() if deploying to Mainnet
    client.setOperator(accountId, privateKey);

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
