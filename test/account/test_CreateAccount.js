import {JSONRPClient} from "../../client.js";
import {getBalanceFromTestnet} from "../../testnetEnquiry.js";
import {expect} from "chai";

/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
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

        // Check if account has been created and has 1000 tinyBar using the JS SDK Client
        let accountBalance = await getBalanceFromTestnet(newAccountId); 
        let accountBalanceTinybars  = BigInt(Number(accountBalance.hbars._valueInTinybar));
        // TODO: use Longs correctly instead of converting to Int
        expect(accountBalanceTinybars).to.equal(1000n); // TODO add initial amount as parameter in createAccount
    })
});
