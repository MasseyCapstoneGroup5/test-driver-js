import {JSONRPClient} from "../../client.js";
import {PublicKey, AccountId, Query, AccountInfoQuery } from "@hashgraph/sdk";
import {getInfoFromTestnet, getBalanceFromTestnet} from "../../testnetEnquiry.js";
import {expect, assert, Assertion} from "chai";

let newAccountId;
let newPrivateKey;
let newPublicKey;
/**
 * Tests get account info parameters
 */
describe('#getAccountInfoTests', function () { // a suite of tests

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

    beforeEach(function () {});
    afterEach(function (done) {done();});

    it('should create account and verify it', async function () {
        // Generate new private & public key
        newPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
        newPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": newPrivateKey
        });

        // CreateAccount with the JSON-RPC
        newAccountId = await JSONRPClient.request("createAccount", {
            "publicKey": newPublicKey
        });

        // Check if account has been created and has 1000 tinyBar using the JS SDK Client
        let accountBalance = await getBalanceFromTestnet(newAccountId); 
        let accountBalanceTinybars  = BigInt(Number(accountBalance.hbars._valueInTinybar));
        // TODO: use Longs correctly instead of converting to Int
        expect(accountBalanceTinybars).to.equal(1000n); // TODO add initial amount as parameter in createAccount
    })

    it("should query instance of account info to/from bytes", async function () {
        const accountId = new AccountId(10);

        const query = Query.fromBytes(
            new AccountInfoQuery().setAccountId(accountId).toBytes()
        );

        expect(query instanceof AccountInfoQuery).to.be.true;

        expect(query.accountId.toString()).to.be.equal(accountId.toString());
    });


    return Promise.resolve();
});