import {JSONRPCRequest} from "../../client.js";
import {PublicKey } from "@hashgraph/sdk";
import {getInfoFromTestnet} from "../../testnetEnquiry.js";
import {updateAccountKey} from "../../generateUpdates.js";
import {expect, assert} from "chai";

let accountId;
let firstPvtKey, firstPublicKey;    // generate first pair of keys for new account
let newPvtKey, newPublicKey;        // generate second pair of keys to test replacing keys
let randomPvtKey, randomPublicKey;  // a random pair to test authorisation failure for replacement

/**
 * Test to update the Public and Private keys on an account and compare results with js SDK
 */
 describe('#updateAccountKey()', function () { 
    this.timeout(10000); 

    before(async function () {
        await JSONRPCRequest("setup", {
                "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
            }
        )
    });
    after(async function () {
        await JSONRPCRequest("reset")
    });

    // create a first set of Public / Private keys via JSON-RPC server for testing update of keys
    it('should create a new key set', async function () {
        firstPvtKey = await JSONRPCRequest("generatePrivateKey", {})
        firstPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": firstPvtKey
        })
    });

    // create a second Public / Private key set for testing update of keys
    it('should create a second key set', async function () {
        newPvtKey = await JSONRPCRequest("generatePrivateKey", {})
        newPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": newPvtKey
        })
    });

    // create a third Public / Private key set for testing invalid authorisation
    it('should create a second key set', async function () {
        randomPvtKey = await JSONRPCRequest("generatePrivateKey", {})
        randomPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": randomPvtKey
        })
    });
   
    // create a new account using JSON-RPC using first public / private key set
    it('should create a new account', async function () {
        accountId = await JSONRPCRequest("createAccount", {
            "publicKey": firstPublicKey
        })
    });    

    it('should retrieve first public key of newly created account via Testnet', async function () {
        // Use the JS SDK Client to retrive public key of new account
        let getAccountInfo = await getInfoFromTestnet(accountId);
        let firstKeySet = getAccountInfo.key;        

        // Check if public key was successfully set
        expect(
            JSON.stringify(firstKeySet))
            .to.equal(
                JSON.stringify(PublicKey.fromString(firstPublicKey))
                );
    });    

    // update the PUBLIC & PRIVATE KEY SET on account via JSON-RPC
    it('should update key on an account via JSON-RPC server', async function () {
        await updateAccountKey(accountId, newPublicKey, firstPvtKey, newPvtKey);        
    });

    // update the PUBLIC & PRIVATE KEY SET on account via JSON-RPC
    it('should test transaction signature', async function () {
        /**
         * The transaction signature is not valid
         * INVALID_SIGNATURE = 7;
         */  
        try {
            await updateAccountKey(accountId, newPublicKey, firstPvtKey, newPvtKey); 
            
        } catch(err) {
            // If error is thrown then check error contains expected status message
            assert.equal(err.code, 7, 'error code is for INVALID_SIGNATURE');
        }        
    });

    // update the PUBLIC & PRIVATE KEY SET on account via JSON-RPC
    it('should test for error in transaction signature', async function () {
        /**
         * The transaction signature is not valid
         * INVALID_SIGNATURE = 7;
         */  
         let testStatus;
         let testarr1 = {
            "tests":[
              {"key":{newPublicKey}, "status":"OK"},
              {"key":{randomPublicKey}, "status":"7"}
            ]
            };       
        try {
            for(let i=0; i<testarr1.tests.length; i++) {
                let keyStr = Object.values(testarr1.tests[i].key)[0];
                console.log("\nPublic Key = " + Object.keys(testarr1.tests[i].key)[0]);
                let statusStr = Object.values(testarr1.tests[i].status).toString();
                testStatus = statusStr.replace(/,/g,"")

                await updateAccountKey(accountId, keyStr, firstPvtKey, newPvtKey);
                expect(testStatus).to.equal("OK");
                console.log("OK " + testStatus);
            }           
        } catch(err) {
            // If error is thrown then check error contains expected status code            
            assert.equal(err.code, testStatus, 'error code is for INVALID_SIGNATURE = 7');
            console.log("ERR " + testStatus);
        }        
    });

    it('verify from Testnet that key set updated', async function () {
        // Use the JS SDK Client to retrieve updated key field of account
        let getAccountInfo = await getInfoFromTestnet(accountId);
        let updatedPublicKey = getAccountInfo.key;

        // Check that key was successfully updated
        expect(
            JSON.stringify(updatedPublicKey))
            .to.equal(
                JSON.stringify(PublicKey.fromString(newPublicKey))
            );
    })
    // Another test in the same suite
    it('test that the two public keys were not the same', async function () {
        //console.log(typeof(JSON.stringify(firstPublicKey)) + "  " + JSON.stringify(firstPublicKey));
        //console.log(typeof(JSON.stringify(newPublicKey)) + "  " + JSON.stringify(newPublicKey));
        assert.notEqual(JSON.stringify(firstPublicKey), JSON.stringify(newPublicKey));
    })
});
