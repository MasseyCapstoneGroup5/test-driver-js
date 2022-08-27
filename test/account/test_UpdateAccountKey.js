import {JSONRPClient} from "../../client.js";
import {Client, AccountInfoQuery, PublicKey } from "@hashgraph/sdk";
import {expect, assert} from "chai";

let accountId;
let firstPvtKey;
let newPvtKey;
let firstPublicKey;
let newPublicKey;
/**
 * Test update account and compare results with js SDK
 */
 describe('#updateAccount()', function () { 
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

    // create a first set of Public / Private keys for testing update of keys
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
   
    // create a new account using first public / private key set
    it('should create a new account', async function () {
        accountId = await JSONRPClient.request("createAccount", {
            "publicKey": firstPublicKey
        })
    });    

    it('should get first public key of newly created account', async function () {
        // Use the JS SDK Client to retrive public key of new account
        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        const getAccountInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(SDKClient);   

        let firstKeySet = getAccountInfo.key;        

        // Check if public key was successfully set
        expect(
            JSON.stringify(firstKeySet))
            .to.equal(
                JSON.stringify(PublicKey.fromString(firstPublicKey))
                );
    });    

    // update key on account
    it('should update key on an account', async function () {
        await JSONRPClient.request("updateAccountKey", {
            "accountId": accountId,
            "newPublicKey": newPublicKey,
            "oldPrivateKey": firstPvtKey,
            "newPrivateKey": newPvtKey
        })

        // Use the JS SDK Client to retrive memo field of new account
        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        const getAccountInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(SDKClient);   

        let updatedPublicKey = getAccountInfo.key;

        // Check that key was successfully updated
        expect(
            JSON.stringify(updatedPublicKey))
            .to.equal(
                JSON.stringify(PublicKey.fromString(newPublicKey))
            );
    })
});
