import dotenv from 'dotenv';
dotenv.config();
import { Client, FileCreateTransaction, Hbar, PrivateKey } from '@hashgraph/sdk';
import fs from 'fs';

// Set up the Hedera client with your account details
const client = Client.forTestnet()
  .setOperator(process.env.HEDERA_ACCOUNT_ID, PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));

async function deployEduLedger() {
  try {
    // Step 1: Read the bytecode for EduLedger contract from a file
    const bytecode = fs.readFileSync('C:/Users/bramme/OneDrive/Desktop/Eduledger/artifacts/contracts/EduLedger.sol/EduLedger.json');  // Update with correct path

    // Step 2: Upload the bytecode file to Hedera
    const fileTx = new FileCreateTransaction()
      .setKeys([PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)]) // Ensure the key is in the correct format
      .setContents(bytecode)
      .setMaxTransactionFee(new Hbar(10));  // Adjust the fee if necessary

    const fileSubmit = await fileTx.execute(client);
    const fileReceipt = await fileSubmit.getReceipt(client);
    const fileId = fileReceipt.fileId;

    console.log(`Bytecode file uploaded. File ID: ${fileId}`);

    // Step 3: Deploy the EduLedger contract using the uploaded bytecode file
    const contractTx = new ContractCreateTransaction()
      .setBytecodeFileId(fileId)
      .setGas(10000000)  // Adjust gas as needed
      .setMaxTransactionFee(new Hbar(100));  // Adjust the fee if necessary

    const contractSubmit = await contractTx.execute(client);
    const contractReceipt = await contractSubmit.getReceipt(client);

    console.log(`EduLedger contract deployed successfully. Contract ID: ${contractReceipt.contractId}`);
  } catch (err) {
    console.error('Error deploying EduLedger contract:', err);
  }
}

// Call the deploy function
deployEduLedger().catch(console.error);
