require('dotenv').config()
var HDWalletProvider = require("@truffle/hdwallet-provider");
const MNEMONIC_BSC = process.env.MNEMONIC;
const MNEMONIC_ETH = process.env.MNEMONIC_ETH;
const MNEMONIC_TESTNET_BSC = process.env.MNEMONIC_TESTNET_BSC;
const MNEMONIC_TESTNET_ROPSTEN = process.env.MNEMONIC_TESTNET_ROPSTEN;
const MNEMONIC_TESTNET_RINKEBY = process.env.MNEMONIC_TESTNET_ROPSTEN;

module.exports = {
	contracts_directory: "./contracts",

	plugins: [
		'truffle-plugin-verify'
	  ],
	
	  api_keys: {
		etherscan: process.env.ETHERSCAN,
		bscscan: process.env.BSCSCAN,
	  },	

	networks: {
		development: {
			host: "127.0.0.1",	
			port: 8545,		
			network_id: "*",
			gasPrice: 2000,
			gas: 12530149,
			skipDryRun: true
		},
		ropsten: {
			provider: function() {
			  return new HDWalletProvider(MNEMONIC_TESTNET_ROPSTEN, "https://ropsten.infura.io/v3/229978a439f942769dedd0bf53cd3c0f")
			},
			network_id: 3,
			gas: 8000000,        // Ropsten has a lower block limit than mainnetdc
			confirmations: 1,    // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
		  },
		  rinkeby: {
			provider: function() {
			  //return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/229978a439f942769dedd0bf53cd3c0f")
			  //return new HDWalletProvider(MNEMONIC, "https://rinkeby.infura.io/v3/7df8332473fd402ca72ce8d5c3a449c9");
			  return new HDWalletProvider(MNEMONIC_TESTNET_RINKEBY, "http://192.168.88.254:8545");
			},
			network_id: 4,
			gas: 9000000,        // Ropsten has a lower block limit than mainnetdc
			confirmations: 1,    // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
		  },

		  bsctest: {
			provider: function() {
			  return new HDWalletProvider(MNEMONIC_TESTNET_BSC, "https://data-seed-prebsc-1-s2.binance.org:8545/")
			},
			confirmations: 1,    // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true ,    // Skip dry run before migrations? (default: false for public nets )
			network_id: 97
		   },

		   bsc: {
			provider: function() {
			  return new HDWalletProvider(MNEMONIC_BSC, "http://192.168.88.231:8545/") 
			},
			gasPrice: 5000000000,
			confirmations: 1,    // # of confs to wait between deployments. (default: 0)
			timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
			skipDryRun: true ,    // Skip dry run before migrations? (default: false for public nets )
			network_id: 56
		   },
	},
	mocha: {
		// reporter: 'eth-gas-reporter',
		// reporterOptions: {
		// 	coinmarketcap: '9ddd66f7-a097-4f29-89ef-f75e9afab370',
		// 	currency: 'USD',
		// 	gasPrice: 130
		// }
	  },
	compilers: {
		solc: {
			version: "v0.8.0+commit.c7dfd78e",
			settings: {
			    optimizer: {
			    	enabled: true,
			    	runs: 200
				},
			},
		},
	},
};