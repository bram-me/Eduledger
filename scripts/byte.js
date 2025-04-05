import fs from 'fs';
import path from 'path';

// To get the current directory in ES module
const __dirname = path.resolve();

// Function to check bytecode size for a contract
const checkBytecodeSize = (contractName) => {
    // Path to the contract artifact
    const contractPath = path.join(__dirname, 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);

    fs.readFile(contractPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${contractName} contract file:`, err);
            return;
        }

        const contractArtifact = JSON.parse(data);
        const bytecode = contractArtifact.bytecode;

        console.log(`${contractName} Bytecode size:`, bytecode.length / 2, 'bytes');  // Divide by 2 to account for hex pairs
    });
};

// Check the size for EduCertificateNFT.sol
checkBytecodeSize('EduCertificateNFT');

// Check the size for EduLedger.sol
checkBytecodeSize('EduLedger');
