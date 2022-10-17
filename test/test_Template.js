import {JSONRPCRequest} from "../client.js";
import {AccountId} from "@hashgraph/sdk";
import fetch from "node-fetch";
import {getAccountInfo} from "../SDKEnquiry.js";
import {setFundingAccount} from "../generateNewAccount.js";
import {assert} from "chai";

/**
 * Explain what this test suite is for here
 */
describe.skip('Hedera functionality we want to test', function () { // a suite of tests
    this.timeout(10000); // Timeout for all tests and hooks within this suite

    // before and after hooks (normally used to set up and reset the client SDK)
    before(async function () {
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY)
    });
    after(async function () {
        await JSONRPCRequest("reset")
    });

    // Before/after each test can also be used
    beforeEach(function () {
    });
    afterEach(function () {
    });
    
    
    describe('Test section name here', function () {
        it('should do something successfully', async function () {
            // 1. Call JSON-RPC (Make sure it is running first)
            let receipt = await JSONRPCRequest("doSomething", {
                "parameter": "value"
            })
            let accountId = new AccountId(receipt.accountId).toString()


            // Get value using Client SDK (Don't use JSON-RPC)
            const respSDK = getAccountInfo(accountId) //from SDKEnquiry.js
            // or setup execute method using SDK Client manually here

            // Get value using Mirror node (optional)
            // add delay here to give mirror node time to update
            let url = `${process.env.MIRROR_NODE_REST_URL}/api/v1/accounts?account.id=${accountId}`;
            const response = await fetch(url);
            const respJSON = await response.json();


            // Check if something was successfully completed
            expect(respSDK).to.equal("value");
            expect(respJSON).to.equal("value");
        })

        // Another test in the same suite
        it('should try to do something but fail and check error code', async function () {
            try {
                // 1. Call JSON-RPC (Make sure it is running first)
                await JSONRPCRequest("doSomethingExpectingError", {
                    "parameter": "value"
                })
            } catch (err) {
                // check if correct error status is thrown
                // custom hedera errors codes can be found here:
                // https://github.com/hashgraph/hedera-protobufs/blob/main/services/response_code.proto
                assert.equal(err.data.status, "INVALID_TRANSACTION");
                return
            }
            assert.fail("Should throw an error")
        })
    })
});
