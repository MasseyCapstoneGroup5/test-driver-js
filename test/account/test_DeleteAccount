import {JSONRPClient} from "../../client.js";
import {Client, Hbar, AccountInfoQuery} from "@hashgraph/sdk";
import {assert, expect} from "chai";

let newAccountId;
let newPrivateKey;
let newAccountBalHbars;
let baseAccountBalHbars;
let updatedBalanceHbars;
/**
 * Test delete account and compare results with js SDK
 */
 describe('#deleteAccount()', function () { 
    this.timeout(10000);

    // before and after hooks (normally used to set up and reset the client SDK)
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

    it('should create a new account', async function () {
        // Generate new private & public key
        newPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
        let newPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": newPrivateKey
        });

        //CreateAccount with the JSON-RPC
        newAccountId = await JSONRPClient.request("createAccount", {
            "publicKey": newPublicKey
        });
    });

    it('should get balance of the new account', async function () {
        //Get balance of newly created account
        let newAccountInfo = await JSONRPClient.request("getAccountInfo", {
            "accountId": newAccountId
        });
        let newAccountBalTinybars = Hbar.fromString(newAccountInfo.balance)._valueInTinybar;  
        newAccountBalHbars = parseInt(Hbar.fromTinybars(newAccountBalTinybars)); 
        //console.log("newAccountBalHB " + newAccountBalHbars);
    });

    it('should get balance of the base (main) account', async function () {
        //Get balance of newly created account
        let baseAccountInfo = await JSONRPClient.request("getAccountInfo", {
            "accountId": process.env.OPERATOR_ACCOUNT_ID
        });
        let baseAccountBalTinybars = Hbar.fromString(baseAccountInfo.balance)._valueInTinybar;        
        baseAccountBalHbars = parseInt(Hbar.fromTinybars(baseAccountBalTinybars)); 
        //console.log("baseAccountBal " + baseAccountBalHbars);
    });

    it('should delete account and set accountId to null', async function () {
        // Delete newly created account with the JSON-RPC
        const deletedAccountId = await JSONRPClient.request("deleteAccount", {
            "accountId": newAccountId,          
            "accountKey": newPrivateKey,  
            "OPERATOR_ID": process.env.OPERATOR_ACCOUNT_ID            
        })
        // Check if deleted account's ID has been removed
        expect(deletedAccountId.accountId).to.equal(null);
    });
    /**
    * Further tests for accountId on Testnet will throw failed precheck error: ACCOUNT_DELETED
    * Instead -> test for transfer of closing balance of deleted account to the base account
    */
    it('test base account received closing balance', async function () {

        const SDKClient = Client.forTestnet();
        SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        let getBaseAccountInf = await new AccountInfoQuery()
        .setAccountId(process.env.OPERATOR_ACCOUNT_ID)
        .execute(SDKClient); 

        let updatedBalanceTinybars = getBaseAccountInf.balance._valueInTinybar;        
        updatedBalanceHbars = parseInt(Hbar.fromTinybars(updatedBalanceTinybars)); 
        //console.log("updatedBalanceHbars " + updatedBalanceHbars);

        // Check if balance was successfully increased by amount of deleted account's balance
        assert.isAtLeast(
            updatedBalanceHbars, 
            baseAccountBalHbars + newAccountBalHbars - 1,
            'new account bal is greater or equal to old bal + closed account bal (less 1 for any fees)'
            );
    })    
});