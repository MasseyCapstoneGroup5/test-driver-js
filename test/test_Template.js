import {JSONRPCRequest} from "../client.js";
import {Client} from "@hashgraph/sdk";
import {expect} from "chai";

/**
 * Explain what this test suite is for here
 */
describe('#functionalityWeWantToTest()', function () { // a suite of tests
    this.timeout(10000); // Timeout for all tests and hooks within this suite

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

    // Before/after each test can also be used
    beforeEach(function () {});
    afterEach(function () {});


    // Test
    it('should do something', async function () {

        // Call JSON-RPC (Make sure it is running first)
        /*let result = await JSONRPCRequest("doSomething", {
            "parameter": "value"
        })*/


        // Get value of something using this Client (Don't use JSON-RPC)
        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        //const something = await new SomethingQuery.execute(SDKClient);
        const something = "value";

        // Check if something was successfully completed
        expect(something).to.equal("value");
    })

    // Another test in the same suite
    it('should do something else', async function () {

    })
});
