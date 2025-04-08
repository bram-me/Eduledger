require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hedera: {
      url: 'https://testnet.hashio.io/api',
      accounts: [process.env.HEDERA_PRIVATE_KEY]
    }
  }
};
