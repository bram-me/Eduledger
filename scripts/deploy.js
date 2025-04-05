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
    const eduCertificateNFT = await EduCertificateNFT.deploy();
    await eduCertificateNFT.deployed();
    console.log(`EduCertificateNFT contract deployed to: ${eduCertificateNFT.address}`);

    // Deploy EduLedger contract
    console.log("Deploying EduLedger contract...");
    const eduTokenAddress = process.env.EDU_TOKEN_ADDRESS; // Assuming you have a token address in your .env file
    const feeCollectorAddress = process.env.FEE_COLLECTOR_ADDRESS; // Address to collect the fees
    
    const EduLedger = await ethers.getContractFactory("EduLedger");
    const eduLedger = await EduLedger.deploy(eduTokenAddress, eduCertificateNFT.address, feeCollectorAddress);
    await eduLedger.deployed();
    console.log(`EduLedger contract deployed to: ${eduLedger.address}`);

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
