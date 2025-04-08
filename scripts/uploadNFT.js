import dotenv from 'dotenv';
dotenv.config();

import { Client, ContractCreateTransaction, FileCreateTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';
import fs from 'fs';

const client = Client.forTestnet()
  .setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

async function uploadAndDeploy() {
  // Step 1: Read the bytecode from the file
  const filePath = 'C:/Users/bramme/OneDrive/Desktop/Eduledger/artifacts/contracts/EduCertificateNFT.sol/EduCertificateNFT.json';
  
  // Read the JSON file and parse it
  const jsonContent = JSON.parse(fs.readFileSync(filePath));
  
  // Check if bytecode exists
  const bytecode = jsonContent.bytecode;
  
  if (!bytecode) {
    console.error("Bytecode is missing in the JSON file. Check the file structure.");
    return;
  }

  console.log("Bytecode successfully extracted:", bytecode);

  // Step 2: Upload bytecode file
  const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);  // Ensuring the key format is correct
  
  const fileTx = new FileCreateTransaction()
    .setKeys([privateKey.publicKey])  // Use public key from private key
    .setContents(bytecode)
    .setMaxTransactionFee(new Hbar(5));  // Increased fee for larger transactions

  const fileSubmit = await fileTx.execute(client);
  const fileReceipt = await fileSubmit.getReceipt(client);
  const fileId = fileReceipt.fileId;

  console.log(`Bytecode file uploaded. File ID: ${fileId}`);

  // Step 3: Deploy the contract using the uploaded file
  const contractTx = new ContractCreateTransaction()
    .setBytecodeFileId(fileId)
    .setGas(1000000)  // Adjust gas as needed
    .setMaxTransactionFee(new Hbar(5));

  const contractSubmit = await contractTx.execute(client);
  const contractReceipt = await contractSubmit.getReceipt(client);

  console.log(`Contract deployed successfully. Contract ID: ${contractReceipt.contractId}`);
}

uploadAndDeploy().catch(console.error);
