import dotenv from 'dotenv';
import {
  Client,
  AccountInfoQuery,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
  Hbar
} from '@hashgraph/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to load the compiled artifact JSON file
async function loadArtifact(contractName) {
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`);
  console.log(`📦 Loading artifact from: ${artifactPath}`);
  const artifactJson = fs.readFileSync(artifactPath, "utf8");
  return JSON.parse(artifactJson);
}

// Function to deploy a large contract by uploading its bytecode in chunks.
async function deployLargeContract(client, bytecodeBuffer, gas = 5_000_000, constructorParams = new ContractFunctionParameters()) {
  // Adjust the max chunk size to 3000 bytes to use many chunks.
  const MAX_CHUNK_SIZE = 3000;
  const totalChunks = Math.ceil(bytecodeBuffer.length / MAX_CHUNK_SIZE);
  console.log(`🚀 Splitting bytecode into ${totalChunks} chunks...`);

  // Create the file with the first chunk of the bytecode.
  const createFileTx = await new FileCreateTransaction()
    .setKeys([client.operatorPublicKey])
    .setContents(bytecodeBuffer.slice(0, MAX_CHUNK_SIZE))
    .setMaxTransactionFee(new Hbar(2))
    .execute(client);

  const createFileRx = await createFileTx.getReceipt(client);
  const fileId = createFileRx.fileId;

  if (!fileId) throw new Error("❌ Failed to create bytecode file.");

  console.log(`✅ Bytecode file created. File ID: ${fileId}`);

  // Append the remaining chunks of the bytecode.
  for (let i = MAX_CHUNK_SIZE; i < bytecodeBuffer.length; i += MAX_CHUNK_SIZE) {
    const chunk = bytecodeBuffer.slice(i, i + MAX_CHUNK_SIZE);
    console.log(`📦 Uploading chunk ${Math.floor(i / MAX_CHUNK_SIZE) + 1} of ${totalChunks}...`);
    await new FileAppendTransaction()
      .setFileId(fileId)
      .setContents(chunk)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);
  }

  console.log(`✅ Bytecode uploaded in ${totalChunks} chunks. File ID: ${fileId}`);

  // Deploy the contract using the uploaded bytecode file.
  const contractTx = await new ContractCreateTransaction()
    .setBytecodeFileId(fileId)
    .setGas(gas)
    .setConstructorParameters(constructorParams)
    .execute(client);

  const contractRx = await contractTx.getReceipt(client);
  const contractId = contractRx.contractId;

  if (!contractId) throw new Error("❌ Failed to deploy contract.");

  console.log(`✅ Contract deployed at: ${contractId}`);
  return contractId;
}

// Main deployment function
async function main() {
  const operatorPrivateKey = process.env.HEDERA_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const operatorAccountId = process.env.HEDERA_ACCOUNT_ID || process.env.ACCOUNT_ID;

  if (!operatorPrivateKey || !operatorAccountId) {
    throw new Error("⚠️ HEDERA_PRIVATE_KEY and HEDERA_ACCOUNT_ID must be set in .env file.");
  }

  const client = Client.forTestnet(); // Change to forMainnet() for production deployment
  client.setOperator(operatorAccountId, operatorPrivateKey);

  try {
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(operatorAccountId)
      .execute(client);

    const balance = accountInfo.balance.toTinybars().toNumber() / 1e8;
    console.log(`✅ Connected. Account balance: ${balance} HBAR`);

    if (balance < 1) throw new Error("❌ Insufficient HBAR for deployment.");

    // --- Deploy EduCertificateNFT Contract ---
    const eduCertificateNFTArtifact = await loadArtifact("EduCertificateNFT");
    // Try to get bytecode from either 'bytecode' or 'deployedBytecode' field.
    const eduCertificateNFTBytecode = eduCertificateNFTArtifact.bytecode || eduCertificateNFTArtifact.deployedBytecode;
    if (!eduCertificateNFTBytecode) {
      throw new Error("❌ Bytecode not found in artifact for EduCertificateNFT.");
    }
    // Remove any leading "0x" and convert to Buffer.
    const nftBuffer = Buffer.from(eduCertificateNFTBytecode.replace(/^0x/, ''), 'hex');

    console.log("🚀 Deploying EduCertificateNFT...");
    const eduCertificateNFTContractId = await deployLargeContract(client, nftBuffer);
    
    // --- Deploy EduLedger Contract ---
    const eduLedgerArtifact = await loadArtifact("EduLedger");
    const eduLedgerBytecode = eduLedgerArtifact.bytecode || eduLedgerArtifact.deployedBytecode;
    if (!eduLedgerBytecode) {
      throw new Error("❌ Bytecode not found in artifact for EduLedger.");
    }
    const ledgerBuffer = Buffer.from(eduLedgerBytecode.replace(/^0x/, ''), 'hex');

    const constructorParams = new ContractFunctionParameters()
      .addAddress(eduCertificateNFTContractId.toSolidityAddress())
      .addAddress(operatorAccountId.toSolidityAddress());

    console.log("🚀 Deploying EduLedger...");
    const eduLedgerContractId = await deployLargeContract(client, ledgerBuffer, 5_000_000, constructorParams);

    console.log(`🎉 EduCertificateNFT Contract: ${eduCertificateNFTContractId}`);
    console.log(`🎉 EduLedger Contract: ${eduLedgerContractId}`);
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("✅ Deployment script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error during deployment:", error);
    process.exit(1);
  });
