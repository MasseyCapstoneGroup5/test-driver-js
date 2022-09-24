import {JSONRPCRequest} from "../../client.js";
import {getInfoFromTestnet} from "../../testnetEnquiry.js";
import {updateAccountMemo} from "../../generateUpdates.js";
import {expect, assert} from "chai";

let newAccountId;
let newPrivateKey;
let memostring;                 // randomly generated memos of 100 or 101 char / nums
let initialMemo, updatedMemo;   // test for change from initial to updated memo on an account
/**
 * Test update of account memo and compare results with js SDK
 */
 describe('#updateAccountMemo()', function () {     
    this.timeout(10000); 

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
    
    // create a new account via JSON-RPC server for update of memo field testing
    it('should create a new account via JSON-RPC server', async function () {
        // Generate new private & public key
        newPrivateKey = await JSONRPCRequest("generatePrivateKey", {})
        let newPublicKey = await JSONRPCRequest("generatePublicKey", {
            "privateKey": newPrivateKey
        });

        // CreateAccount with the JSON-RPC
        newAccountId = await JSONRPCRequest("createAccount", {
            "publicKey": newPublicKey
        });
    });

    // Retrieve initial (default) memo value of newly created account from Testnet
    it('should get initial memo value using Testnet', async function () {
        // Use the JS SDK Client to retrieve default memo from new account
        let getAccountInfo = await getInfoFromTestnet(newAccountId);
        initialMemo = getAccountInfo.accountMemo;
    });   

    // change value in memo field to a random five-character string via JSON-RPC
    it('should test memo field is too long', async function () {        
        // TODO optional create new account without a memo instead of using a random memo value
        /**
         * Transaction memo size exceeded 100 bytes
         * MEMO_TOO_LONG = 8;
         */
         const testarr = {
            "100": "OK",
            "101": "8",
        };
        for (const [key, value] of Object.entries(testarr)) {  
            try {
                memostring = await generateLongString(key);
                await updateAccountMemo(newAccountId, newPrivateKey, memostring);               

                expect(value).to.equal("OK");

            } catch(err) {
                // If error is thrown then check error message contains the expected status code
                //console.log("ERR " + value);
                assert.equal(err.code, value, 'error code is for MEMO_TOO_LONG');
            }           
        }        
    });

    it('should verify memo was updated on Testnet', async function () {
        // update memo on account
        memostring = await generateLongString(99);
        await updateAccountMemo(newAccountId, newPrivateKey, memostring);

        // Use the JS SDK Client to retrieve memo field of new account
        let getAccountInfo = await getInfoFromTestnet(newAccountId);
        updatedMemo = getAccountInfo.accountMemo;

        // Check if memo was successfully updated
        expect(updatedMemo).to.equal(memostring);
    });

    // Another test in the same suite
    it('test initial memo was set to default value for new account', async function () {
        const emptyMemoStr = '';
        assert.strictEqual(initialMemo, emptyMemoStr);
    })
    it('test updated accountMemo is the same as set memo value', async function () {
        assert.strictEqual(updatedMemo, memostring);
    })
    it('test initial memo and updated memo are string value ', async function () {
        assert.isString(initialMemo, memostring);
    })
    it('test the updated memo is nopt the initial memo', async function () {
        assert.notEqual(memostring, initialMemo);
    })  
});

async function generateLongString(numRepetitions) {
    // keeps concatenating one-character strings to make longer string
    let longString = ""
    for(let i=0; i<numRepetitions; i++) {
        let genLongStr = Math.random().toString(36).slice(-1);
        longString += genLongStr;
    }        
    return longString;
}
