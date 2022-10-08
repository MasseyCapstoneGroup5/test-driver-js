``# test-driver-js

## Setup

Clone repository

    git clone https://github.com/MasseyCapstoneGroup5/test-driver-js.git

Enter Project directory

    cd test-driver-js


### Decide between Testnet or a local node

#### Testnet
* Get a Hedera testnet account ID and private key from Hedera [here](https://portal.hedera.com/register)
* rename `.env.testnet` to `.env`
* Add ECDSA account ID and private key to `.env`

#### Local node
* Start your [hedera-local-node](https://github.com/hashgraph/hedera-local-node)
* rename `.env.custom_node` to `.env`

### Install and run

Install packages with npm

    npm install
    
Start the [JSON-RPC Server](https://github.com/MasseyCapstoneGroup5/json-rpc-js-sdk)


Run specific test file

    npm run test test/account/test_CreateAccount.js

Run all tests

    npm run test


### Reports
After running `npm run test` the generated HTML and JSON reports can be found in the mochawesome-report folder