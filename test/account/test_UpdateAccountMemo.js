import {JSONRPClient} from "../../client.js";
import {Client, AccountInfoQuery } from "@hashgraph/sdk";
import {expect, assert} from "chai";

let newAccountId;
let newPrivateKey;
let initialMemo;
let updatedMemo;

// generate a memo of five random char / nums
const newRandomMemo = Math.random().toString(36).slice(-5);

/**
 * Test update account and compare results with js SDK
 */
 describe('#updateAccount()', function () { 
    this.timeout(10000); 

    // before and after hooks (normally used to set up and reset the client SDK)
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
    
    // create a new account for update of memo field testing
    it('should create a new account', async function () {
        // Generate new private & public key
        newPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
        let newPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": newPrivateKey
        });

        // CreateAccount with the JSON-RPC
        newAccountId = await JSONRPClient.request("createAccount", {
            "publicKey": newPublicKey
        });
    });

    // Retrieve initial (default) memo value of newly created account
    it('should get initial memo value', async function () {
        let newAccountInfo = await JSONRPClient.request("getAccountInfo", {
            "accountId": newAccountId
        });
        initialMemo = newAccountInfo.accountMemo;
    });   

    // change value in memo field to a random five-character string
    it('should update memo on an account', async function () {
        // TODO optional create new account without a memo instead of using a random memo value

        await JSONRPClient.request("updateAccountMemo", {
            "accountId": newAccountId,
            "key": newPrivateKey,
            "memo": newRandomMemo
        })

        // Use the JS SDK Client to retrive memo field of new account
        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        const getAccountInfo = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(SDKClient);   

        updatedMemo = getAccountInfo.accountMemo;

        // Check if memo was successfully updated
        expect(updatedMemo).to.equal(newRandomMemo);
    })

    // Another test in the same suite
    it('test initial memo was set to default value for new account', async function () {
        const emptyMemoStr = '';
        assert.strictEqual(initialMemo, emptyMemoStr);
    })
    it('test updated accountMemo is the same as set memo value', async function () {
        assert.strictEqual(updatedMemo, newRandomMemo);
    })
    it('test initial memo and updated memo are string value ', async function () {
        assert.isString(initialMemo, updatedMemo);
    })
    it('test the updated memo is nopt the initial memo', async function () {
        assert.notEqual(updatedMemo, initialMemo);
    })
});
