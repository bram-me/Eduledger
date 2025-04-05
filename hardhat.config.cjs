require('dotenv').config();  // To load .env variables

module.exports = {
  solidity: {
    version: "0.8.28",  // Your Solidity version
    settings: {
      optimizer: {
        enabled: true,
        runs: 200  // Typical optimization setting
      }
    }
  },
  networks: {
    hedera: {
      url: 'https://testnet.hedera.com/api/v1', // Testnet endpoint (change to mainnet if needed)
      accounts: [`${process.env.HEDERA_PRIVATE_KEY}`] // Ensure the private key is passed as a 32-byte HEX string
    }
  }
};
