import dotenv from 'dotenv';
import { Client, PrivateKey, AccountBalanceQuery, AccountInfoQuery, ContractCreateTransaction, ContractFunctionParameters } from '@hashgraph/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadArtifact(contractName) {
    const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
    console.log(`Loading artifact from: ${artifactPath}`);
    const artifactJson = fs.readFileSync(artifactPath, "utf8");
    return JSON.parse(artifactJson);
}

// Main function to run the deployment script
async function main() {
  const operatorPrivateKey = process.env.HEDERA_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const operatorAccountId = process.env.HEDERA_ACCOUNT_ID || process.env.ACCOUNT_ID;

  if (!operatorPrivateKey || !operatorAccountId) {
    throw new Error("⚠️ HEDERA_PRIVATE_KEY and HEDERA_ACCOUNT_ID must be set in .env file.");
  }

  // Connect to Hedera Testnet (or Mainnet)
  const client = Client.forTestnet(); // Use Client.forMainnet() for production
  client.setOperator(operatorAccountId, operatorPrivateKey);

  try {
    console.log("🔎 Checking account info...");

    // Fetch account info
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(operatorAccountId)
      .execute(client);

    console.log("🔍 Account Info:", accountInfo);

    if (!accountInfo || !accountInfo.balance) {
      throw new Error("❌ Account info or balance is undefined.");
    }

    // Extract the balance in tinybars and convert it to HBAR
    const balanceInTinybars = accountInfo.balance._valueInTinybar;
    const balanceInHbars = balanceInTinybars / 1e8; // Convert tinybars to HBAR (1 HBAR = 1e8 tinybars)
    console.log(`✅ Connected! Account balance: ${balanceInHbars} HBAR`);

    if (balanceInHbars < 1) {
      throw new Error("❌ Insufficient HBAR balance for deployment.");
    }

    console.log("🚀 Deploying contracts...");

    // Deploy EduCertificateNFT
    const eduCertificateNFTArtifact = await loadArtifact("EduCertificateNFT");
    const eduCertificateNFTBytecode = eduCertificateNFTArtifact.bytecode;

    console.log("📜 Deploying EduCertificateNFT...");
    const eduCertificateNFTTx = await new ContractCreateTransaction()
      .setBytecode(eduCertificateNFTBytecode)
      .setGas(5_000_000)
      .execute(client);

    const eduCertificateNFTReceipt = await eduCertificateNFTTx.getReceipt(client);
    const eduCertificateNFTContractId = eduCertificateNFTReceipt.contractId;

    if (!eduCertificateNFTContractId) {
      throw new Error("❌ Failed to deploy EduCertificateNFT contract.");
    }

    console.log(`✅ EduCertificateNFT deployed at: ${eduCertificateNFTContractId.toString()}`);

    // Deploy EduLedger
    const eduLedgerArtifact = await loadArtifact("EduLedger");
    const eduLedgerBytecode = eduLedgerArtifact.bytecode;

    console.log("📜 Deploying EduLedger...");
    const eduLedgerTx = await new ContractCreateTransaction()
      .setBytecode(eduLedgerBytecode)
      .setGas(5_000_000)
      .setConstructorParameters(
        new ContractFunctionParameters()
          .addAddress(eduCertificateNFTContractId.toSolidityAddress())
          .addAddress(operatorAccountId.toSolidityAddress())
      )
      .execute(client);

    const eduLedgerReceipt = await eduLedgerTx.getReceipt(client);
    const eduLedgerContractId = eduLedgerReceipt.contractId;

    if (!eduLedgerContractId) {
      throw new Error("❌ Failed to deploy EduLedger contract.");
    }

    console.log(`✅ EduLedger deployed at: ${eduLedgerContractId.toString()}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Execute the main function
main()
  .then(() => {
    console.log("🎉 Deployment script finished.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error during deployment:", error);
    process.exit(1);
  });
