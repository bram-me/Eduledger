import fs from "fs";
import { Client, ContractCreateTransaction, ContractFunctionParameters, AccountBalanceQuery } from "@hashgraph/sdk";
import dotenv from "dotenv";
import path from "path";
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

async function main() {
    const operatorPrivateKey = process.env.HEDERA_PRIVATE_KEY;
    const operatorAccountId = process.env.HEDERA_ACCOUNT_ID;

    if (!operatorPrivateKey || !operatorAccountId) {
        throw new Error("HEDERA_PRIVATE_KEY and HEDERA_ACCOUNT_ID must be set in .env file.");
    }

    const client = Client.forTestnet(); // Change to forMainnet() for production
    client.setOperator(operatorAccountId, operatorPrivateKey);

    // Check account balance
    const balance = await new AccountBalanceQuery()
        .setAccountId(operatorAccountId)
        .execute(client);

    const balanceInHbars = balance.hbars.toTinybars() / 1e8;
    console.log(`Account balance: ${balanceInHbars} HBAR`);

    if (balanceInHbars < 1) {
        throw new Error("Insufficient HBAR balance for deployment.");
    }

    console.log("Deploying contracts...");

    try {
        // Deploy EduCertificateNFT
        const eduCertificateNFTArtifact = await loadArtifact("EduCertificateNFT");
        const eduCertificateNFTBytecode = eduCertificateNFTArtifact.bytecode;

        console.log("Deploying EduCertificateNFT...");
        const eduCertificateNFTTx = await new ContractCreateTransaction()
            .setBytecode(eduCertificateNFTBytecode)
            .setGas(5_000_000) // 5 million gas
            .execute(client);

        const eduCertificateNFTReceipt = await eduCertificateNFTTx.getReceipt(client);
        const eduCertificateNFTContractId = eduCertificateNFTReceipt.contractId;

        console.log(`✅ EduCertificateNFT deployed at: ${eduCertificateNFTContractId}`);

        // Deploy EduLedger
        const eduLedgerArtifact = await loadArtifact("EduLedger");
        const eduLedgerBytecode = eduLedgerArtifact.bytecode;

        console.log("Deploying EduLedger...");
        const eduLedgerTx = await new ContractCreateTransaction()
            .setBytecode(eduLedgerBytecode)
            .setGas(5_000_000) // Adjust gas as needed
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(eduCertificateNFTContractId.toSolidityAddress())
                    .addAddress(operatorAccountId.toSolidityAddress())
            )
            .execute(client);

        const eduLedgerReceipt = await eduLedgerTx.getReceipt(client);
        const eduLedgerContractId = eduLedgerReceipt.contractId;

        console.log(`✅ EduLedger deployed at: ${eduLedgerContractId}`);

    } catch (error) {
        console.error("❌ Deployment failed:", error);
    }
}

main()
    .then(() => {
        console.log("🎉 Deployment script finished.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error during deployment:", error);
        process.exit(1);
    });
