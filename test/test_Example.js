import {JSONRPClient} from "../client.js";
import {Client, AccountBalanceQuery} from "@hashgraph/sdk";
import {expect} from "chai";

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

    it('should create account', async function () {
        // Generate new private & public key
        let newPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
        let newPublicKey = await JSONRPClient.request("generatePublicKey", {
                "privateKey": newPrivateKey
        });

        // CreateAccount with the JSON-RPC
       let newAccountId = await JSONRPClient.request("createAccount", {
           "publicKey": newPublicKey
       });

        // Check if account has been created and has at least 1 tinyBar using the JS SDK Client
        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(SDKClient);
        const accountBalanceTinybars = accountBalance.hbars.toTinybars().toInt(); // TODO: use Longs correctly instead of converting to Int
        expect(accountBalanceTinybars).to.equal(1000); // TODO add initial amount as parameter in createAccount

    }).timeout(10000); // TODO: Better timeout functionality (use callback done)
});