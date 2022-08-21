import {JSONRPClient} from "../../client.js";
import {expect} from "chai";

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


    it('should update memo for account', async function () {

        let newRandomMemo = Math.random().toString(36).slice(-5);
        // TODO optional create new account without a memo instead of using a random memo value

        // UpdateAccount with the JSON-RPC
        await JSONRPClient.request("updateAccount", {
            "accountId": process.env.OPERATOR_ACCOUNT_ID,
            "key": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY,
            // add a memo to the AccountInfo
            "memo": newRandomMemo
        });
        // Check if memo has changed using the JS SDK Client
        let accountInfo = await JSONRPClient.request("getAccountInfo", {
                "accountId": process.env.OPERATOR_ACCOUNT_ID
            })
        ;
        //console.log(accountInfo.accountMemo);
        expect(accountInfo.accountMemo).to.equal(newRandomMemo);
    })


});