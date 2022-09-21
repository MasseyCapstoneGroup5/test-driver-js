import {JSONRPCRequest} from "../../client.js";
import {getInfoFromTestnet} from "../../testnetEnquiry.js";
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
 describe('#updateAccountMemo()', function () { 
    this.timeout(10000); 

    // before and after hooks (normally used to set up and reset the client SDK)
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
    
    // create a new account via JSON-RPC server for update of memo field testing
    it('should create a new account via JSON-RPC server', async function () {
        // Generate new private & public key
        newPrivateKey = await JSONRPCRequest("generatePrivateKey", {})
        let newPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": newPrivateKey
        });

        // CreateAccount with the JSON-RPC
        newAccountId = await JSONRPCRequest("createAccount", {
            "publicKey": newPublicKey
        });
    });

    // Retrieve initial (default) memo value of newly created account from Testnet
    it('should get initial memo value using Testnet', async function () {
        // Use the JS SDK Client to retrieve default memo from new account
        let getAccountInfo = await getInfoFromTestnet(newAccountId);
        initialMemo = getAccountInfo.accountMemo;
    });   

    // change value in memo field to a random five-character string via JSON-RPC
    it('should update memo on an account via JSON-RPC server', async function () {
        // TODO optional create new account without a memo instead of using a random memo value

        await JSONRPCRequest("updateAccountMemo", {
            "accountId": newAccountId,
            "key": newPrivateKey,
            "memo": newRandomMemo
        })
    });

    it('should verify memo was updated on Testnet', async function () {
        // Use the JS SDK Client to retrieve memo field of new account
        let getAccountInfo = await getInfoFromTestnet(newAccountId);
        updatedMemo = getAccountInfo.accountMemo;

        // Check if memo was successfully updated
        expect(updatedMemo).to.equal(newRandomMemo);
    });

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
