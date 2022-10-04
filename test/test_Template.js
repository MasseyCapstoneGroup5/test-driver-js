import {JSONRPCRequest} from "../client.js";
import {Client} from "@hashgraph/sdk";
import {expect} from "chai";
import fetch from "node-fetch";
import {setFundingAccount} from "../generateNewAccount.js";

/**
 * Explain what this test suite is for here
 */
describe('#functionalityWeWantToTest()', function () { // a suite of tests
    this.timeout(10000); // Timeout for all tests and hooks within this suite

    // before and after hooks (normally used to set up and reset the client SDK)
    before(async function () {
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY)
    });
    after(async function () {
        await JSONRPCRequest("reset")
    });

    // Before/after each test can also be used
    beforeEach(function () {});
    afterEach(function () {});


    // Test
    it('should do something (template test)', async function () {

        // Call JSON-RPC (Make sure it is running first)
        /*let result = await JSONRPCRequest("doSomething", {
            "parameter": "value"
        })*/


        // Get value of something using this Client SDK (Don't use JSON-RPC)
        //const val = getAccountInfo(accountID) //from SDKEnquiry.js
        const val = "value";

        // Double check value in using REST API (optional)
        let url = `${process.env.MIRROR_NODE_REST_URL}/api/v1/accounts`;
        const response = await fetch(url);
        const respJSON = await response.json();


        // Check if something was successfully completed
        expect(val).to.equal("value");
        //expect(respJSON).to.equal("value");
    })

    // Another test in the same suite
    it('should do something else (template test)', async function () {

    })
});
