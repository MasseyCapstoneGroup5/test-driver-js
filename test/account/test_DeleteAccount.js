import {JSONRPClient} from "../../client.js";
import {Client, Hbar, AccountInfoQuery} from "@hashgraph/sdk";
import {assert, expect} from "chai";

let newAccountId;
let newAccountPrivateKey;
let newAccountBal;

let recipientAccountId;
let recipientPrivateKey;
let recipientInitialBal;
let recipientFinalBal;
/**
 * Test delete account and compare results with js SDK
 * Two test accounts will be created -- 
 * 'newAccount' -- will be the account that is eventually deleted
 * 'recipientAccount' --  will receive closing balance of newAccount
 */
 describe('#deleteAccount()', function () { 
    this.timeout(10000);

    before(async function generateAccountId() {
        await JSONRPClient.request("setup", {
                "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
            }
        )
    });
    after(async function () {
        await JSONRPClient.request("reset")
    });

    it('should create newAccount', async function () {
        // Generate new private & public key
        newAccountPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
        let newPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": newAccountPrivateKey
        });
        //CreateAccount with the JSON-RPC
        newAccountId = await JSONRPClient.request("createAccount", {
            "publicKey": newPublicKey
        });
    });

    it('should create recipientAccount', async function () {
        // Generate new private & public key
        recipientPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
        let recipientPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": recipientPrivateKey
        });
        //CreateAccount with the JSON-RPC
        recipientAccountId = await JSONRPClient.request("createAccount", {
            "publicKey": recipientPublicKey
        });
    });

    it('should get initial balance of newAccount', async function () {
        //Get balance of newAccount
        let newAccountInfo = await JSONRPClient.request("getAccountInfo", {
            "accountId": newAccountId
        });
        newAccountBal = BigInt(Hbar.fromString(newAccountInfo.balance)._valueInTinybar); 
    });
    it('should get initial balance of recipientAccount', async function () {
        //Get balance of recipientAccount
        let recipientAccountInfo = await JSONRPClient.request("getAccountInfo", {
            "accountId": recipientAccountId
        });
        recipientInitialBal = BigInt(Hbar.fromString(recipientAccountInfo.balance)._valueInTinybar);       
    }); 

    it('should delete newAccount and transfer its balance to recipientAccount', async function () {
        // Delete newly created account with the JSON-RPC
        const deletedAccountId = await JSONRPClient.request("deleteAccount", {
            "accountId": newAccountId,          
            "accountKey": newAccountPrivateKey,  
            "recipientId": recipientAccountId            
        })
        // Check if deleted account's ID has been removed
        expect(deletedAccountId.accountId).to.equal(null);
    });
    /**
    * Further tests for accountId on Testnet will throw failed precheck error: ACCOUNT_DELETED
    * Instead -> test for transfer of newAccount's closing balance to recipientAccount
    */
    it('test recipientAccount received closing balance', async function () {

        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        let getAccountInf = await new AccountInfoQuery()
        .setAccountId(recipientAccountId)
        .execute(SDKClient); 

        recipientFinalBal = BigInt(getAccountInf.balance._valueInTinybar); 

        // Check if recipient's balance was successfully increased by amount of deleted account's balance
        assert.strictEqual(recipientFinalBal, newAccountBal +recipientInitialBal,
            "new recipientAccount bal is its initial bal + the deleted account's closing bal "
           );
    })    
});
