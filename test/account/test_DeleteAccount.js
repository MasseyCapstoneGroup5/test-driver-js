import {JSONRPCRequest} from "../../client.js";
import {getAccountInfo, getBalance} from "../../SDKEnquiry.js";
import {assert} from "chai";
import {setFundingAccount} from "../../generateNewAccount.js";
import {
    Client,
    PrivateKey,
    Hbar,
    AccountId,
    TransferTransaction,
  } from "@hashgraph/sdk";

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
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY)
    });
    after(async function () {
        await JSONRPCRequest("reset")
    });

    // Create an account via an alias account
    it("should create an account via an alias account", async function () {

        let client = Client.forTestnet().setOperator(
            AccountId.fromString(process.env.OPERATOR_ACCOUNT_ID),
            PrivateKey.fromString(process.env.OPERATOR_ACCOUNT_PRIVATE_KEY)
        )
        const privateKey = PrivateKey.generateECDSA()
        const publicKey = privateKey.publicKey;
  
        // Assuming that the target shard and realm are known.
        // For now they are virtually always 0 and 0.
        const aliasAccountId = publicKey.toAccountId(0, 0)
        /*
        * Note that no queries or transactions have taken place yet.
        * This account "creation" process is entirely local.
        */
          const response = await new TransferTransaction()
          .addHbarTransfer(process.env.OPERATOR_ACCOUNT_ID, new Hbar(10).negated())
          .addHbarTransfer(aliasAccountId, new Hbar(10))
          .execute(client);
  
          let receipt =  await response.getReceipt(client)
          // query account via consensus node to verify creation
        const accountInfoFromConsensusNode = await getAccountInfo(aliasAccountId)
        //console.log(`The aliased account ID: 0.0.${info.aliasKey.toString()}`);
  
      })

    it('should create newAccount via JSON-RPC server', async function () {
        // Generate new private & public key
        newAccountPrivateKey = await JSONRPCRequest("generatePrivateKey", {})
        let newPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": newAccountPrivateKey
        });
        //CreateAccount with the JSON-RPC
        let response = await JSONRPCRequest("createAccount", {
            "publicKey": newPublicKey
        })
        newAccountId = response.accountId;
    });

    it('should create recipientAccount via JSON-RPC server', async function () {
        // Generate new private & public key
        recipientPrivateKey = await JSONRPCRequest("generatePrivateKey", {})
        let recipientPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": recipientPrivateKey
        });
        //CreateAccount with the JSON-RPC
        let response = await JSONRPCRequest("createAccount", {
            "publicKey": recipientPublicKey
        });
        recipientAccountId = response.accountId;

    });
    
    it('should get initial balance of newAccount', async function () {
        let accountBalance = await getBalance(newAccountId);
        newAccountBal  = BigInt(Number(accountBalance.hbars._valueInTinybar));
    });

    it('should get initial balance of recipientAccount', async function () {
        let accountBalance = await getBalance(recipientAccountId);
        recipientInitialBal  = BigInt(Number(accountBalance.hbars._valueInTinybar));  
    }); 

    it('should delete newAccount and transfer its balance to recipientAccount', async function () {
        // Delete newly created account via the JSON-RPC
        console.log("\nDeleting account " + newAccountId);
        await JSONRPCRequest("deleteAccount", {
            "accountId": newAccountId,          
            "accountKey": newAccountPrivateKey,  
            "recipientId": recipientAccountId            
        })
    });
    /**
    * Further tests for newAccountId will throw failed precheck error: ACCOUNT_DELETED
    * Instead -> test for transfer of newAccount's closing balance to recipientAccount
    */
    it('check that recipientAccount received closing balance', async function () {
        let accountBalance = await getBalance(recipientAccountId);
        recipientFinalBal  = BigInt(Number(accountBalance.hbars._valueInTinybar)); 
      
        // Check if recipient's balance was successfully increased by amount of deleted account's balance
        assert.strictEqual(recipientFinalBal, newAccountBal +recipientInitialBal,
            "new recipientAccount bal is its initial bal + the deleted account's closing bal "
           );
    })  
    
    it('test that newAccount is deleted', async function () {
        /**
         * the account has been marked as deleted
         * ACCOUNT_DELETED = 72;
         **/ 
        try {
            console.log("\nTry to enquire on account " + newAccountId);
            await getAccountInfo(newAccountId);
        } catch (err) {
            assert.equal(err.status.toString(), "ACCOUNT_DELETED");
            return
        }
        assert.fail("Should throw an error")
    })
});
