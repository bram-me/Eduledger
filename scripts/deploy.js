import pkg from "hardhat";
const { ethers } = pkg;
import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();  // To load environment variables from the .env file

async function main() {
    // Fetch private key and account ID from environment variables
    const operatorPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
    const operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);

    // Setup Hedera client for Testnet (or Mainnet depending on configuration)
    const client = Client.forTestnet(); // Use Client.forMainnet() for Mainnet deployment
    client.setOperator(operatorAccountId, operatorPrivateKey);

    console.log("Deploying smart contracts to Hedera...");

    // Deploy EduCertificateNFT contract
    console.log("Deploying EduCertificateNFT contract...");
    const EduCertificateNFT = await ethers.getContractFactory("EduCertificateNFT");

    let eduCertificateNFT;
    try {
        eduCertificateNFT = await EduCertificateNFT.deploy();
        console.log("Contract deployed:", eduCertificateNFT); // Debugging line
        const receipt = await eduCertificateNFT.deployTransaction.wait();
        console.log(`Transaction hash for EduCertificateNFT: ${receipt.transactionHash}`);
    } catch (error) {
        console.error("Error deploying EduCertificateNFT contract:", error);
        return;
    }

    // Use the deployer's address as the fee collector
    const feeCollectorAddress = operatorAccountId.toString();

    // Deploy EduLedger contract
    console.log("Deploying EduLedger contract...");
    const eduTokenAddress = "0x0000000000000000000000000000000000000000"; // Use zero address if no token is provided
    const EduLedger = await ethers.getContractFactory("EduLedger");
    let eduLedger;
    try {
        eduLedger = await EduLedger.deploy(eduTokenAddress, eduCertificateNFT.address, feeCollectorAddress);
        console.log("EduLedger deployed:", eduLedger);
        const ledgerReceipt = await eduLedger.deployTransaction.wait();
        console.log(`Transaction hash for EduLedger: ${ledgerReceipt.transactionHash}`);
    } catch (error) {
        console.error("Error deploying EduLedger contract:", error);
        return;
    }

    // Log deployed contract addresses
    console.log(`EduLedger Address: ${eduLedger.address}`);
    console.log(`EduCertificateNFT Address: ${eduCertificateNFT.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error during deployment:", error);
        process.exit(1);
    });
