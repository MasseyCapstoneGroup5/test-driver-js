import {JSONRPClient} from "../../client.js";
import {PublicKey } from "@hashgraph/sdk";
import {getInfoFromTestnet} from "../../testnetEnquiry.js";
import {expect, assert} from "chai";

let accountId;
let firstPvtKey;
let newPvtKey;
let firstPublicKey;
let newPublicKey;
/**
 * Test to update the Public and Private keys on an account and compare results with js SDK
 */
 describe('#updateAccountKey()', function () { 
    this.timeout(10000); 

    before(async function () {
        await JSONRPClient.request("setup", {
                "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
            }
        )
    });
    after(async function () {
        await JSONRPClient.request("reset")
    });

    // create a first set of Public / Private keys via JSON-RPC server for testing update of keys
    it('should create a new key set', async function () {
        firstPvtKey = await JSONRPClient.request("generatePrivateKey", {})
        firstPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": firstPvtKey
        })
    });

    // create a second Public / Private key set for testing update of keys
    it('should create a second key set', async function () {
        newPvtKey = await JSONRPClient.request("generatePrivateKey", {})
        newPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": newPvtKey
        })
    });
   
    // create a new account using JSON-RPC using first public / private key set
    it('should create a new account', async function () {
        accountId = await JSONRPClient.request("createAccount", {
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
        await JSONRPClient.request("updateAccountKey", {
            "accountId": accountId,
            "newPublicKey": newPublicKey,
            "oldPrivateKey": firstPvtKey,
            "newPrivateKey": newPvtKey
        })
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
