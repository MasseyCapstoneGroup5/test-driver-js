import {JSONRPCRequest} from "../../client.js";
import {AccountId, Query, AccountInfoQuery} from "@hashgraph/sdk";
import {getBalanceFromTestnet} from "../../testnetEnquiry.js";
import {
    createAccountAsFundingAccount,
    createTestAccount,
    generateAccountKeys,
    setFundingAccount
} from "../../generateNewAccount.js";
import fetch from "node-fetch";
import {assert, expect} from "chai";

/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
    this.timeout(15000);

    after(async function () {
        await JSONRPCRequest("reset")
    });

    //----------- Key is needed to sign each transfer -----------
    // Create an account
    it('Creates an account', async function() {

        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);         
        let {publicKey} = await generateAccountKeys();
        let newAccountId = await createTestAccount(publicKey, 1000);

        const query = new AccountInfoQuery()
        .setAccountId(newAccountId);

        let accountID = '0.0.' + query.accountId.num.low;     
        let url = `https://testnet.mirrornode.hedera.com/api/v1/accounts?account.id=${accountID}`;
        await delay(4000);
        delay(4000).then(() => console.log('ran after 4 seconds passed'));

        const response = await fetch(url);
        const respJSON = await response.json();   
        const mirrorID = respJSON.accounts[0].account;

        console.log("accountId" + accountID + ' mirrorID ' + mirrorID);
        //return { "accountId": accountID, "mirrorID": mirrorID };
        expect(newAccountId).to.equal(accountID);
        expect(newAccountId).to.equal(mirrorID);      
    })

    // Create an account with no public key
    it('Creates an account with no public key', async function(){
        let testAcct = await createTestAccount(key);

        expect(testAcctID).to.be.true
    })
    // Create an account with an invalid public key
    it('Creates an account with an invalid public key', async function(){
        let invalidKey = 101010;
        let testAcct = await createTestAccount(key, invalidKey);

        expect(testAcctID).to.be.false
    })
    it('should test invalid initial balance', async function () {
        /**
         * Attempt to set negative initial balance
         * INVALID_INITIAL_BALANCE = 85;
         **/ 
        // test array could potentially be a json file stored with key value pairs, E.g.
        const testarr1 = {
            "0": "OK",
            "1": "OK",
            "100": "OK",
            "-1": "85",
            "-0": "OK",
        };
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        // Select key value pairs from test array
        for (const [key, value] of Object.entries(testarr1)) {
            // CreateAccount with the JSON-RPC
            try {
                let {publicKey} = await generateAccountKeys();

                console.log("\nInitialBalance = " + key);
                let testAcctID = await createTestAccount(publicKey, key);

                // If error is not thrown then check if account has been created
                // and has the amount of tinyBar set by the key pair, using the JS SDK Client
                let accountBalance = await getBalanceFromTestnet(testAcctID);
                let accountBalanceTinybars = convertToTinybar(accountBalance);
                expect(accountBalanceTinybars).to.equal(BigInt(Number(parseInt(key))));
                expect(value).to.equal("OK");
                console.log("OK " + value);
            } catch (err) {
                // If error is thrown then check error message contains the expected value from
                // the key value pairs
                assert.equal(err.code, value, 'error code equals value from testarr1');
                console.log("ERR " + value);
            }
        }
    })

    it('should test insufficient payer balance', async function () {
        /**
         * The payer account has insufficient cryptocurrency to pay the transaction fee
         * INSUFFICIENT_PAYER_BALANCE = 10;
        **/
        // boundary testing sufficient payer balance
        const initialBalance = 500000000;
        const testarr2 = {
            "400000000": "OK",
            "500000001": "10"
        };

        // Select key value pairs from test array 2
        for (const [key, value] of Object.entries(testarr2)) {
            // create a first test account that will be used as the funding account for a second test account
            await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);

            // allocate an initial balance of 5 HBAr to the funding account
            await createAccountAsFundingAccount(initialBalance);

            // CreateAccount with the JSON-RPC
            try {
                let {publicKey} = await generateAccountKeys();

                console.log("\nInitialBalance = " + key);
                let testAcctID = await createTestAccount(publicKey, key);


                // If error is not thrown then check if account has been created
                // and has the amount of tinyBar set by the key pair, using the JS SDK Client
                let testAcctBal = await getBalanceFromTestnet(testAcctID);
                let accountBalanceTinybars = convertToTinybar(testAcctBal);

                // console.log("testAcctBal " + accountBalanceTinybars + "\n");
                expect(accountBalanceTinybars).to.equal(BigInt(Number(parseInt(key))));
                expect(value).to.equal("OK");
                console.log("OK " + value);
            } catch (err) {
                // If error is thrown then check error code contains the expected value from
                // the key value pairs
                assert.equal(err.code, value, 'error code equals value from testarr2');
                console.log("ERR " + value);
            }
        }
    })
// Set initial balance to -100 HBAR
it('Sets initial balance to -100 HBAR', async function(){

})
// Set the initial balance to more than operator balance
it('Sets initial balance to more than operator balance', async function(){

})

//-----------  Account key signs transactions depositing into account ----------- 
// Require a receiving signature when creating account transaction
it('Creates account transaction and returns Receiver signature required to true', async function(){

})
// Creates new account transaction that doesn't require a signature
it('Creates new account transaction without Receiver signature required', async function(){

})

//----------- Maximum number of tokens that an Account be associated with -----------
// Creates an account with a default max token association
it('Creates an account with a default max token association', async function(){

})
// Creates an account with max token set to the maximum 
it('Creates an account with a max token set to the maximum', async function(){

})
// Create an account with token association over the maximum
it('Creates an account with a token association over the maximum', async function(){
    
})
// Create an account with a max token association of -1
it('Creates an account with a max token association of -1', async function(){
    
})

//----------- Staked ID - ID of the account to which is staking --------------------
// Create an account and set staked account ID to operator account ID
it('Creates an account and sets staked account ID to operator account ID', async function(){

})
// Create an acount and set staked node ID and a node ID
it('Creates an account and sets staked node ID and a node ID', async function(){
    
})
// Create an account and set the staked account ID to an invalid ID
it('Creates an account and sets the staked account ID to an invalid ID', async function(){

})
// Create an account and set the staked node ID to an invalid node
it('Creates an account and sets the staked node ID to an invalid node', async function(){

})
// Create an account and set staked account ID with no input
it('Creates an account and sets staked account ID with no input', async function(){

})
// Create an account and set the staked node ID with no input
it('Creates an account and sets the staked node ID with no input', async function(){

})
// Create an account and set both a staking account ID and node ID
it('Creates an account and sets both a staking account ID and node ID', async function(){

})

//----------- If true - account declines receiving a staking reward -----------
// Create an account and set the account to decline staking rewards
it('Creates an account and set the account to decline staking rewards', async function(){

})
// Create an account and leave decline rewards at default value
it('Creates an account and leave staking rewards at default value', async function(){

})
// Create an account set the decline rewards value to 5
it('Creates an account and set the decline rewards value to 5', async function(){

})
//----------- Memo associated with the account (UTF-8 encoding, max 100 bytes)
// Create an account with a memo
it('Creates an account with a memo', async function () {

})
// Create an account with a memo that exceeds 100 characters
it('Creates an account with a memo exceeding 100 characters', async function (){

})
// Auto renew period ----------------------------------

return Promise.resolve();
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function convertToTinybar(hbarVal) {
        // transforms Hbar to Tinybar at ratio 1: 100,000,000
        return BigInt(Number(hbarVal.hbars._valueInTinybar));
    }
});
