import {JSONRPCRequest} from "../../client.js";
import {getInfoFromTestnet, getBalanceFromTestnet} from "../../testnetEnquiry.js";
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
        await JSONRPCRequest("setup", {
                "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
            }
        )
    });
    after(async function () {
        await JSONRPCRequest("reset")
    });

    it('should create newAccount via JSON-RPC server', async function () {
        // Generate new private & public key
        newAccountPrivateKey = await JSONRPCRequest("generatePrivateKey", {})
        let newPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": newAccountPrivateKey
        });
        //CreateAccount with the JSON-RPC
        newAccountId = await JSONRPCRequest("createAccount", {
            "publicKey": newPublicKey
        });
    });

    it('should create recipientAccount via JSON-RPC server', async function () {
        // Generate new private & public key
        recipientPrivateKey = await JSONRPCRequest("generatePrivateKey", {})
        let recipientPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": recipientPrivateKey
        });
        //CreateAccount with the JSON-RPC
        recipientAccountId = await JSONRPCRequest("createAccount", {
            "publicKey": recipientPublicKey
        });
    });
    
    it('should get initial balance of newAccount from Testnet', async function () {
        let accountBalance = await getBalanceFromTestnet(newAccountId); 
        newAccountBal  = BigInt(Number(accountBalance.hbars._valueInTinybar));
    });

    it('should get initial balance of recipientAccount from Testnet', async function () {
        let accountBalance = await getBalanceFromTestnet(recipientAccountId); 
        recipientInitialBal  = BigInt(Number(accountBalance.hbars._valueInTinybar));  
    }); 

    it('should delete newAccount and transfer its balance to recipientAccount', async function () {
        // Delete newly created account via the JSON-RPC
        const deletedAccountId = await JSONRPCRequest("deleteAccount", {
            "accountId": newAccountId,          
            "accountKey": newAccountPrivateKey,  
            "recipientId": recipientAccountId            
        })
        // Check if deleted account's ID has been removed
        expect(deletedAccountId.accountId).to.equal(null);
    });
    /**
    * Further tests for newAccountId on Testnet will throw failed precheck error: ACCOUNT_DELETED
    * Instead -> test for transfer of newAccount's closing balance to recipientAccount
    */
    it('check via Testnet that recipientAccount received closing balance', async function () {
        let accountBalance = await getBalanceFromTestnet(recipientAccountId); 
        recipientFinalBal  = BigInt(Number(accountBalance.hbars._valueInTinybar)); 
      
        // Check if recipient's balance was successfully increased by amount of deleted account's balance
        assert.strictEqual(recipientFinalBal, newAccountBal +recipientInitialBal,
            "new recipientAccount bal is its initial bal + the deleted account's closing bal "
           );
    })  
    
    it('test via Testnet that newAccount is deleted', async function () {
        try {
            await getInfoFromTestnet(newAccountId);
        } catch (err) {
            assert.include(err.message, 'ACCOUNT_DELETED');
            return
        }
        assert.isOk(false, 'getInfoFromTestnet must throw error')
    })
});
