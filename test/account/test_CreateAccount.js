import {JSONRPCRequest} from "../../client.js";
import {getAccountInfo} from "../../SDKEnquiry.js";
import {
    createAccountAsFundingAccount,
    createTestAccount,
    createTestAccountNoKey,
    createAccountStakedId,
    generateAccountKeys,
    setFundingAccount,
} from "../../generateNewAccount.js";
import {
    createMaxTokenAssociation
} from "../../generateTransactions.js";
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
    describe('Key signature for each transfer', function () {
        // Create an account
        it('Creates an account', async function() {

            await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
            let {publicKey} = await generateAccountKeys();
            let newAccountId = await createTestAccount(publicKey, 1000);

            const accInf = await getAccountInfo(newAccountId);
            let accountID = accInf.accountId.toString();
            await delay(4000);

            let url = `${process.env.MIRROR_NODE_REST_URL}/api/v1/accounts?account.id=${accountID}`;
            const response = await fetch(url);
            const respJSON = await response.json();
            const mirrorID = respJSON.accounts[0].account;
    
            expect(newAccountId).to.equal(accountID);
            expect(newAccountId).to.equal(mirrorID);      
        })
        // Create an account with no public key
        it('Creates an account with no public key', async function(){
            /**
             * Key not provided in the transaction body
             * KEY_REQUIRED = 26;
            **/
            try {
                await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);      
                await createTestAccountNoKey();
    
            } catch(err) {
                assert.equal(err.code, 26, 'error code is KEY_REQUIRED');
            }       
        })
        // Create an account with an invalid public key
        it('Creates an account with an invalid public key', async function(){
            
        })
        
        // Set initial balance to -100 HBAR
        it('Sets initial balance to -1000 TinyBAR', async function(){
            /**
             * Attempt to set negative initial balance
             * INVALID_INITIAL_BALANCE = 85;
             **/  
            try {
                await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY); 
                let {publicKey} = await generateAccountKeys();
                let initBal = -1000;
                await createTestAccount(publicKey, initBal);
            } catch (err) {
                // If error is thrown then check error message contains the expected value from
                // the key value pairs
                assert.equal(err.code, "85", 'error code 85 for INVALID_INITIAL_BALANCE');
            }
        })
        // Set the initial balance to more than operator balance
        it('Sets initial balance to more than operator balance', async function(){
            /**
             * The payer account has insufficient cryptocurrency to pay the transaction fee
             * INSUFFICIENT_PAYER_BALANCE = 10;
            **/
            const initialBalance = 500000000; 
            const payerBalance = 500000001; 
            // create a first test account that will be used as the funding account for a second test account
            await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
            // allocate an initial balance of 5 HBAr to the funding account
            await createAccountAsFundingAccount(initialBalance);
            // CreateAccount with the JSON-RPC
            try {
                let {publicKey} = await generateAccountKeys();
                await createTestAccount(publicKey, payerBalance);
    
            } catch (err) {
                // If error is thrown then check error code contains the expected value from
                // the key value pairs
                assert.equal(err.code, "10", 'error code 10 for INSUFFICIENT_PAYER_BALANCE');
            }
        })
    })
    //-----------  Account key signs transactions depositing into account ----------- 
    // Require a receiving signature when creating account transaction
    describe('Account key signatures to deposit into account', function(){
        it('Creates account transaction and returns Receiver signature required to true', async function(){

        })
        // Creates new account transaction that doesn't require a signature
        it('Creates new account transaction without Receiver signature required', async function(){

        })
    });
    //----------- Maximum number of tokens that an Account be associated with -----------
    describe('Max Token Association', function(){
        // Creates an account with a default max token association (0)
        //The accounts maxAutomaticTokenAssociations can be queried on the consensus node with AccountInfoQuery
        it('Creates an account with a default max token association', async function(){
            try{
                let {publicKey, privateKey} = await generateAccountKeys();
                let newAccountId = await createTestAccount(publicKey, 0);

                let accInf = await getAccountInfo(newAccountId);
                let maxAssoc = await createMaxTokenAssociation(
                    0,
                    privateKey.toString(), 
                    accInf.accountId.toString());
                assert.equal(maxAssoc.maxAutomaticTokenAssociations, 0);
            }
            catch (err) {
                console.error(err);
            }
        })
        // Creates an account with max token set to the maximum (1000)
        it('Max token set to the maximum', async function(){            
            try{
                let {publicKey, privateKey} = await generateAccountKeys();
                let newAccountId = await createTestAccount(publicKey, 0);

                let accInf = await getAccountInfo(newAccountId);
                let maxAssoc = await createMaxTokenAssociation(
                    1000,
                    privateKey.toString(), 
                    accInf.accountId.toString());
                assert.equal(maxAssoc.maxAutomaticTokenAssociations, 1000);
            }
            catch (err) {
                console.error(err);
            }
        })
        // Create an account with token association over the max (2000)
        it('Max token association over the maximum', async function(){
            try{
                let {publicKey, privateKey} = await generateAccountKeys();
                let newAccountId = await createTestAccount(publicKey, 0);

                let accInf = await getAccountInfo(newAccountId);
                let maxAssoc = await createMaxTokenAssociation(
                    2000,
                    privateKey.toString(), 
                    accInf.accountId.toString());
                assert.equal(maxAssoc.maxAutomaticTokenAssociations, 3);
            }
            catch (err) {
                console.error(err);
            }
        })
        // Create an account with a max token association of -1
        it('Max token association of -1', async function(){
            try{
                let {publicKey, privateKey} = await generateAccountKeys();
                let newAccountId = await createTestAccount(publicKey, 0);

                let accInf = await getAccountInfo(newAccountId);
                let maxAssoc = await createMaxTokenAssociation(
                    -1,
                    privateKey.toString(), 
                    accInf.accountId.toString());
                assert.equal(maxAssoc.maxAutomaticTokenAssociations, 3);
            }
            catch (err) {
                console.error(err);
            }
        })
    });
    //----------- Staked ID - ID of the account to which is staking --------------------
    describe('Staked ID, ID of account to which is staking', async function() {
        // Create an account and set staked account ID to operator account ID
        it('Creates an account and sets staked account ID to operator account ID', async function(){
            await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
            let {publicKey} = await generateAccountKeys(); 
            let newAccountId = await createAccountStakedId(publicKey, 1000, process.env.OPERATOR_ACCOUNT_ID);   

            const accountInfoFromConsensusNode = await getAccountInfo(newAccountId);
            let accountID = accountInfoFromConsensusNode.accountId.toString();
            let stakedIDFromConsensusNode = accountInfoFromConsensusNode.stakingInfo.stakedAccountId.toString();
            await delay(4000);

            let url = `${process.env.MIRROR_NODE_REST_URL}/api/v1/accounts?account.id=${accountID}`;
            const response = await fetch(url);
            const respJSON = await response.json();  
            const stakedIDFromMirrorNode = respJSON.accounts[0].staked_account_id; 
    
            expect(stakedIDFromConsensusNode).to.equal(process.env.OPERATOR_ACCOUNT_ID);
            expect(stakedIDFromMirrorNode).to.equal(process.env.OPERATOR_ACCOUNT_ID); 
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
    });
    //----------- If true - account declines receiving a staking reward -----------
    describe('Account declines receiving a staking reward', async function(){
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
    });
    return Promise.resolve();
    function delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    function convertToTinybar(hbarVal) {
        // transforms Hbar to Tinybar at ratio 1: 100,000,000
        return BigInt(Number(hbarVal.hbars._valueInTinybar));
    }
});
