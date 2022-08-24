import {JSONRPClient} from "../../client.js";
import {Client, AccountInfoQuery } from "@hashgraph/sdk";
import {expect, assert} from "chai";

let getAccountInf;
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

    // Test
    it('should update memo on an account', async function () {
        // generate a memo of five random char / nums
        const newRandomMemo = Math.random().toString(36).slice(-5);
        // console.log(newRandomMemo);
        // TODO optional create new account without a memo instead of using a random memo value

        // add a memo to the AccountInfo
        await JSONRPClient.request("updateAccount", {
            "accountId": process.env.OPERATOR_ACCOUNT_ID,
            "key": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY,
            "memo": newRandomMemo
        })

        // Check if memo has changed using the JS SDK Client
        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        getAccountInf = await new AccountInfoQuery()
        .setAccountId(process.env.OPERATOR_ACCOUNT_ID)
        .execute(SDKClient);   

        // Check if memo field was successfully updated
        expect(getAccountInf.accountMemo).to.equal(newRandomMemo);
    })

    // Another test in the same suite
    it('should return true', async function () {
        const emptyMemoStr = '';
        assert.notEqual(getAccountInf.accountMemo, emptyMemoStr);
    })
    it('should return false', async function () {
        // generate a memo of four random char / nums
        const testMemoStr4 = Math.random().toString(36).slice(-4);
        assert.equal(getAccountInf.accountMemo, testMemoStr4);
    })
    it('should return false', async function () {
        // generate a memo of six random char / nums
        const testMemoStr6 = Math.random().toString(36).slice(-6);
        assert.strictEqual(getAccountInf.accountMemo, testMemoStr6);
    })
    it('should return false', async function () {
        const testMemoNum = 10;
        assert.equal(getAccountInf.accountMemo, testMemoNum);
    })
});