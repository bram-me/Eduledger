// Importing necessary packages and contract artifacts
const { ethers } = require("hardhat");
const { Client, PrivateKey, AccountId } = require("@hashgraph/sdk");
require("dotenv").config();  // To load environment variables from the .env file

// Main function to deploy contracts
async function main() {
    // Fetch private key and account ID from environment variables
    const operatorPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    const operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);

    // Setup Hedera client for Testnet (or Mainnet depending on configuration)
    const client = Client.forTestnet(); // Use Client.forMainnet() for Mainnet deployment
    client.setOperator(operatorAccountId, operatorPrivateKey);

    // Log the deployment process
    console.log("Deploying contracts to Hedera...");

    // Deploy EduLedger contract
    console.log("Deploying EduLedger contract...");
    const EduLedger = await ethers.getContractFactory("EduLedger");
    const eduLedger = await EduLedger.deploy();
    await eduLedger.deployed();
    console.log(`EduLedger contract deployed to: ${eduLedger.address}`);

    // Deploy EduCertificateNFT contract
    console.log("Deploying EduCertificateNFT contract...");
    const EduCertificateNFT = await ethers.getContractFactory("EduCertificateNFT");
    const eduCertificateNFT = await EduCertificateNFT.deploy();
    await eduCertificateNFT.deployed();
    console.log(`EduCertificateNFT contract deployed to: ${eduCertificateNFT.address}`);

    // Optionally, link EduLedger contract with EduCertificateNFT contract
    try {
        console.log("Linking EduLedger contract to EduCertificateNFT contract...");
        await eduLedger.setNFTContractAddress(eduCertificateNFT.address); // Assuming you have a method for this
        console.log(`EduLedger linked to EduCertificateNFT at: ${eduCertificateNFT.address}`);
    } catch (err) {
        console.error("Error linking EduLedger contract to EduCertificateNFT:", err);
    }

    // Log confirmation of successful deployment
    console.log(`Contracts deployed successfully to Hedera!`);

    // Log deployed contract addresses (you can use these in your front-end or future transactions)
    console.log(`EduLedger Address: ${eduLedger.address}`);
    console.log(`EduCertificateNFT Address: ${eduCertificateNFT.address}`);
}

// Run the deployment script
main()
    .then(() => process.exit(0)) // Exit on success
    .catch((error) => {
        console.error("Error during deployment:", error);
        process.exit(1); // Exit with error code if something goes wrong
    });
