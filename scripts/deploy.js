import dotenv from 'dotenv';
import {
  Client,
  AccountId,
  PrivateKey,
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

// Load compiled contract artifact
async function loadArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact for ${contractName} not found at ${artifactPath}`);
  }

  const artifact = fs.readFileSync(artifactPath, 'utf8');
  return JSON.parse(artifact);
}

// Upload bytecode in 20 chunks
async function uploadBytecodeFile(client, bytecodeBuffer) {
  const CHUNK_SIZE = Math.ceil(bytecodeBuffer.length / 20); // Calculate chunk size to split into 20 chunks
  const totalChunks = Math.ceil(bytecodeBuffer.length / CHUNK_SIZE);

  console.log(`📤 Uploading bytecode in ${totalChunks} chunks...`);

  // Create initial file
  const createFileTx = await new FileCreateTransaction()
    .setKeys([client.operatorPublicKey])
    .setContents(bytecodeBuffer.slice(0, CHUNK_SIZE))
    .setMaxTransactionFee(new Hbar(2))
    .execute(client);

  const createFileRx = await createFileTx.getReceipt(client);
  const fileId = createFileRx.fileId;
  if (!fileId) throw new Error("❌ Failed to create file on Hedera.");

  // Append remaining chunks
  for (let i = CHUNK_SIZE; i < bytecodeBuffer.length; i += CHUNK_SIZE) {
    const chunk = bytecodeBuffer.slice(i, i + CHUNK_SIZE);

    await new FileAppendTransaction()
      .setFileId(fileId)
      .setContents(chunk)
      .setMaxTransactionFee(new Hbar(2))
      .execute(client);

    console.log(`   📦 Uploaded chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${totalChunks}`);
  }

  console.log(`✅ Bytecode file uploaded. File ID: ${fileId}`);
  return fileId;
}


// Deploy contract
async function deployContract(client, fileId, gas, constructorParams = new ContractFunctionParameters()) {
  const contractTx = await new ContractCreateTransaction()
    .setBytecodeFileId(fileId)
    .setGas(gas)
    .setConstructorParameters(constructorParams)
    .execute(client);

  const contractRx = await contractTx.getReceipt(client);
  const contractId = contractRx.contractId;

  if (!contractId) throw new Error("❌ Contract deployment failed.");
  console.log(`✅ Contract deployed at ${contractId}`);
  return contractId;
}

// Main logic
async function main() {
  const operatorId = process.env.HEDERA_ACCOUNT_ID;
  const operatorKey = process.env.HEDERA_PRIVATE_KEY;
  const network = process.env.HEDERA_NETWORK || "testnet";

  if (!operatorId || !operatorKey) {
    throw new Error("Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
  }

  const client = Client.forName(network).setOperator(operatorId, operatorKey);

  // Check balance
  const info = await new AccountInfoQuery().setAccountId(operatorId).execute(client);
  const balance = info.balance;
  console.log(`💰 Operator balance: ${balance.toString()}`);

  if (balance.toTinybars().toNumber() < 1e8) {
    throw new Error("❌ Not enough HBAR for deployment.");
  }

  // ───── Deploy EduCertificateNFT ─────
  const nftArtifact = await loadArtifact("EduCertificateNFT");
  const nftBytecode = nftArtifact.bytecode.replace(/^0x/, '');
  const nftBuffer = Buffer.from(nftBytecode, 'hex');

  console.log("🚀 Deploying EduCertificateNFT...");
  const nftFileId = await uploadBytecodeFile(client, nftBuffer);
  const nftContractId = await deployContract(client, nftFileId, 5_000_000);

  // ───── Deploy EduLedger ─────
  const ledgerArtifact = await loadArtifact("EduLedger");
  const ledgerBytecode = ledgerArtifact.bytecode.replace(/^0x/, '');
  const ledgerBuffer = Buffer.from(ledgerBytecode, 'hex');

  const constructorParams = new ContractFunctionParameters()
    .addAddress(nftContractId.toSolidityAddress())
    .addAddress(AccountId.fromString(operatorId).toSolidityAddress());

  console.log("🚀 Deploying EduLedger...");
  const ledgerFileId = await uploadBytecodeFile(client, ledgerBuffer);
  const ledgerContractId = await deployContract(client, ledgerFileId, 5_000_000, constructorParams);

  // ───── Final Log ─────
  console.log("\n🎉 Deployment Complete:");
  console.log(`   🧾 EduCertificateNFT: ${nftContractId}`);
  console.log(`   📚 EduLedger: ${ledgerContractId}`);
}

main()
  .then(() => console.log("✅ Script finished."))
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
