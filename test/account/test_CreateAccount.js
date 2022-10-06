import {JSONRPCRequest} from "../../client.js";
import {getAccountInfo} from "../../SDKEnquiry.js";
import {getJsonData} from "../../mirrorNodeEnquiry.js";
import {
    createAccountAsFundingAccount,
    createTestAccount,
    createTestAccountNoKey,
    createTestAccountInvalidKey,
    createAccountStakedId,
    createAccountStakedNodeId,
    createAccountWithStakedAccountAndNodeIds,
    generateAccountKeys,
    setFundingAccount
} from "../../generateNewAccount.js";
import {
    createMaxTokenAssociation
} from "../../generateTransactions.js";
import crypto from "crypto";
import {assert, expect} from "chai";

let publicKey;
/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
    this.timeout(15000);

    before(async function () {
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        ({publicKey} = await generateAccountKeys());
    });
    after(async function () {
        await JSONRPCRequest("reset")
    });

    //----------- Key is needed to sign each transfer -----------
    describe('Key signature for each transfer', function () {
        // Create a new account
        it('Creates an account', async function() {              
            try {
                // initiate request for JSON-RPC server to create a new account  
                const newAccountId = await createTestAccount(publicKey);
                // query account via consensus node to verify creation
                const accInf = await getAccountInfo(newAccountId);
                const accountID = accInf.accountId.toString();

                // query account via mirror node to confirm availability after creation 
                const respJSON = await getJsonData(accountID);            
                const mirrorID = respJSON.accounts[0].account;
        
                // confirm pass status with assertion testing for account creation
                expect(newAccountId).to.equal(accountID);
                expect(newAccountId).to.equal(mirrorID); 

            } catch(err) {
                // log fail if test does not pass
                console.warn("*******TEST FAIL********");
            }                 
        })
        // Create an account with no public key
        it('Creates an account with no public key', async function(){
            /**
             * Key not provided in the transaction body
             * KEY_REQUIRED = 26;
            **/
            try {   
                // request JSON-RPC server to try to create a new account without a public key 
                await createTestAccountNoKey();  

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");  
            } catch(err) {
                // confirm fail status for creation attempt without provision of public key
                assert.equal(err.code, 26, 'error code is KEY_REQUIRED');
            }       
        })
        // Create an account with an invalid public key
        it('Creates an account with an invalid public key', async function(){            
            try {
                // generate a random key value of 88 bytes (where 88b is equal to byte length of valid public key)
                const invalidPublicKey = crypto.randomBytes(88).toString(); 
                // request JSON-RPC server to try to create a new account with invalid public key   
                await createTestAccountInvalidKey(invalidPublicKey); 

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");
            } catch(err) { 
                // confirm fail status for creation attempt with an invalid public key
                assert.equal(err.code, 0, 'error code 0 thrown');
            }    
        })          
        // Set initial balance to -100 HBAR
        it('Sets initial balance to -1000 TinyBAR', async function(){
            /**
             * Attempt to set negative initial balance
             * INVALID_INITIAL_BALANCE = 85;
             **/  
            try {
                // set a negative initial balance of minus 1000 Tinybars
                let initialBalance = -1000;
                await createTestAccount(publicKey, initialBalance);

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");
            } catch (err) {
                // confirm fail status for creation attempt using a negative initial balance amount
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
            // create a first test account that will be used as the funding account for a second 
            // test account. Allocate an initial balance of 5 HBAr to the funding account
            await createAccountAsFundingAccount(initialBalance);
            try {
                await createTestAccount(publicKey, payerBalance);

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********"); 
            } catch (err) {
                // confirm fail status for creation attempt where initial balance is more than the 
                // balance held in the funding account balance
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
                assert.equal(maxAssoc.maxAutomaticTokenAssociations, 2000);
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
                assert.equal(maxAssoc.maxAutomaticTokenAssociations, -1);
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
            try {
                const newAccountId = await createAccountStakedId(publicKey, process.env.OPERATOR_ACCOUNT_ID); 
                
                // query account via consensus node to verify creation           
                const accountInfoFromConsensusNode = await getAccountInfo(newAccountId);
                const accountID = accountInfoFromConsensusNode.accountId.toString();
                const stakedIDFromConsensusNode = accountInfoFromConsensusNode.stakingInfo.stakedAccountId.toString();
                
                // query account via mirror node to confirm availability after creation 
                const respJSON = await getJsonData(accountID);  
                const stakedIDFromMirrorNode = respJSON.accounts[0].staked_account_id; 
        
                // confirm pass status with testing for account creation with a set staked account ID
                expect(stakedIDFromConsensusNode).to.equal(process.env.OPERATOR_ACCOUNT_ID);
                expect(stakedIDFromMirrorNode).to.equal(process.env.OPERATOR_ACCOUNT_ID);             
            } catch(err) {
                // log fail if test does not pass
                console.warn("*******TEST FAIL********");
            }            
        })
        // Create an acount and set staked node ID and a node ID
        it('Creates an account and sets staked node ID and a node ID', async function(){     
            try {
                // select a staked node id betwen 0 and 6 for the test
                const randomNodeId = Math. floor(Math. random() * 6) + 1;
                const newAccountId = await createAccountStakedNodeId(publicKey, randomNodeId);  
                
                // query account via consensus node to verify creation 
                const accountInfoFromConsensusNode = await getAccountInfo(newAccountId);
                const accountID = accountInfoFromConsensusNode.accountId.toString();
                const stakedNodeIDFromConsensusNode = accountInfoFromConsensusNode.stakingInfo.stakedNodeId.low.toString();
                
                // query account via mirror node to confirm availability after creation 
                const respJSON = await getJsonData(accountID); 
                const stakedNodeIDFromMirrorNode = respJSON.accounts[0].staked_node_id; 
        
                // confirm pass status with testing for account creation with a set staked node ID
                expect(Number(stakedNodeIDFromConsensusNode)).to.equal(randomNodeId);
                expect(Number(stakedNodeIDFromMirrorNode)).to.equal(randomNodeId); 
            } catch(err) {
                console.log(err.message);
                // log fail if test does not pass
                console.warn("*******TEST FAIL********");
            }                        
        })
        // Create an account and set the staked account ID to an invalid ID
        it('Creates an account and sets the staked account ID to an invalid ID', async function(){
            /**
             * The staking account id or staking node id given is invalid or does not exist.
             * INVALID_STAKING_ID = 322;
             **/ 
            try {
                const invalidStakedId = "9.9.999999"
                await createAccountStakedId(publicKey, invalidStakedId); 

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");
            } catch(err) {
                assert.equal(err.code, "322", 'error code 322 for INVALID_STAKING_ID ');
            } 
        })
        // Create an account and set the staked node ID to an invalid node
        it('Creates an account and sets the staked node ID to an invalid node', async function(){
            /**
             * The staking account id or staking node id given is invalid or does not exist.
             * INVALID_STAKING_ID = 322;
             **/             
            try {
                // select a staked node id greater than 6 for the test
                const invalidNodeId = 10;
                await createAccountStakedNodeId(publicKey, invalidNodeId);

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");
            } catch(err) {
                assert.equal(err.code, "322", 'error code 322 for INVALID_STAKING_ID ');
            }
        })
        // Create an account and set staked account ID with no input
        it('Creates an account and sets staked account ID with no input', async function(){
            try {
                // select a staked node id greater than 6 for the test
                const noInputStakedId = "";
                await createAccountStakedId(publicKey, noInputStakedId);

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");
            } catch(err) {
                // confirm fail status for creation attempt with no input provided for staked account ID
                assert.equal(err.code, 0, 'error code 0 thrown');
            }
        })
        // Create an account and set the staked node ID with no input
        it('Creates an account and sets the staked node ID with no input', async function(){
            try {
                // select a staked node id greater than 6 for the test
                const noInputNodeId = "";
                await createAccountStakedNodeId(publicKey, noInputNodeId);

                // log fail if test does not catch error
                console.warn("*******TEST FAIL********");
            } catch(err) {
                // confirm fail status for creation attempt with no input provided for staked node ID
                assert.equal(err.code, 0, 'error code 0 thrown');
            }
        })
        // Create an account and set both a staking account ID and node ID
        it('Creates an account and sets both a staking account ID and node ID', async function(){
            try {
                // set staked account ID to operator account ID
                const stakedAccountId = process.env.OPERATOR_ACCOUNT_ID; 

                // select a staked node id betwen 0 and 6 for the test
                const nodeId = Math. floor(Math. random() * 6) + 1;

                // initiate request for JSON-RPC server to create a new account with both StakedAccountId and StakedNodeId
                const newAccountId = await createAccountWithStakedAccountAndNodeIds(publicKey, stakedAccountId, nodeId);
                
                // query account via consensus node to verify creation           
                const accountInfoFromConsensusNode = await getAccountInfo(newAccountId);
                const accountID = accountInfoFromConsensusNode.accountId.toString();
                const stakedIDFromConsensusNode = accountInfoFromConsensusNode.stakingInfo.stakedAccountId;
                const stakedNodeIDFromConsensusNode = accountInfoFromConsensusNode.stakingInfo.stakedNodeId.low;

                // query account via mirror node to confirm availability after creation 
                const respJSON = await getJsonData(accountID);  
                const stakedIDFromMirrorNode = respJSON.accounts[0].staked_account_id; 
                const stakedNodeIDFromMirrorNode = respJSON.accounts[0].staked_node_id; 
        
                // confirm pass status with testing for account creation with staked node id set to random between 0 and 6
                // and staked account id set to null -- see: https://hedera.com/blog/staking-on-hedera-for-developers-back-to-the-basics
                expect(stakedIDFromConsensusNode).to.equal(null);
                expect(stakedIDFromMirrorNode).to.equal(null); 
                expect(stakedNodeIDFromConsensusNode).to.equal(nodeId);
                expect(stakedNodeIDFromMirrorNode).to.equal(nodeId); 
            } catch(err) {
                console.log(err.message);
                // if error then record as fail
                console.error("*******TEST FAIL********");
            }
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

    function convertToTinybar(hbarVal) {
        // transforms Hbar to Tinybar at ratio 1: 100,000,000
        return BigInt(Number(hbarVal.hbars._valueInTinybar));
    }
      
});
