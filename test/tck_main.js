import {JSONRPClient} from "../client.js";
import {Client, AccountInfo} from "@hashgraph/sdk";
import {expect} from "chai";
// mocha --file "./test/setup.js" "./test/**/*.spec.js"
//setup
before(function() {
    /**
     * Very basic test with hardcoded values. Setup doesn't need to be run
     */
    describe('#generatePublicKey()', function () {
        it('should return the correct public key', async function () {
            let response = await JSONRPClient.request("generatePublicKey", {
                    "privateKey": "302e020100300506032b657004220420c036915d924e5b517fae86ce34d8c76005cb5099798a37a137831ff5e3dc0622 "
                }
            )
            expect(response).to.equal('302a300506032b657003210008530ea4b75f639032eda3c18f41a296cf631d1828697e4f052297553139f347');
        });
    });

    /**
     * Test Create account and compare results with js SDK
     */
    describe('#createAccount()', function () {

        beforeEach(async function () {
            await JSONRPClient.request("setup", {
                    "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                    "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
                }
            )
        });
    });
});

//teardown
after(function() {
    //todo: teardown function
});

