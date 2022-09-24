# test-driver-js

## Setup

Clone repository

    git clone https://github.com/MasseyCapstoneGroup5/test-driver-js.git

Enter Project directory

    cd test-driver-js
    
Get a Hedera testnet account ID and private key from Hedera [here](https://portal.hedera.com/register) 

* Add account ID and private key to `.env`


Install packages with npm

    npm install
    
Start the [JSON-RPC Server](https://github.com/MasseyCapstoneGroup5/json-rpc-js-sdk)


Run specific test file

    npm run test test/test_Example.js

Run all tests

    npm run test
