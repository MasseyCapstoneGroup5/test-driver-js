import {JSONRPClient} from "../../client.js";
import {getBalanceFromTestnet} from "../../testnetEnquiry.js";
import {generateAccountKey, 
    createTestAccount, 
    setFundingAccount, 
    createAccountAsFundingAccount,
    getId,
    getPvtKey} from "../../generateNewAccount.js";
import {assert, expect} from "chai";
/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
    this.timeout(15000);

    after(async function () {
            await JSONRPClient.request("reset")
        });

    it('should test invalid initial balance', async function () {

        // test array could potentially be a json file stored with key value pairs, E.g.
        const testarr1 = [ 
            {"-1": "INVALID_INITIAL_BALANCE"}, 
            {"-0": "OK"},
            {"0": "OK"},
            {"1": "OK"}
        ]; 
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        // Select key value pairs from test array
        for (var i = 0; i < testarr1.length; i++){
            var obj = testarr1[i];
            for (var key in obj){
                var value = obj[key];
            }
            // CreateAccount with the JSON-RPC
            try {
                let testAcctPublicKey = await generateAccountKey();

                console.log("\n" + (i + 1) + ". Test to create account with initialBalnce = " + key);
                let testAcctID = await createTestAccount(testAcctPublicKey, key);

                // If error is not thrown then check if account has been created 
                // and has the amount of tinyBar set by the key pair, using the JS SDK Client
                let accountBalance = await getBalanceFromTestnet(testAcctID); 
                let accountBalanceTinybars  = convertToTinybar(accountBalance);  
                // TODO: use Longs correctly instead of converting to Int
                expect(accountBalanceTinybars).to.equal(BigInt(Number(parseInt(key))));
                console.log((i+1) + ": OK " + value);

            } catch(err) {
                // If error is thrown then check error message contains the expected value from 
                // the key value pairs
                // console.log("Error mssge: " + err.message + ". Expected val: " + value);
                assert.include(err.message, value, 'error message contains value substring');
                console.log((i+1) + ": ERR " + value);
            }                
        }     
    })
    
    it('should test insufficient payer balance', async function () {        
        // deduct 2.5Hbar from the funding account's 5Hbar each time a new account is created
        // the first will succeed as 5 - 2.5 = 2.5Hbar, the second will not as 2.5 - 2.6 will be insufficient
        const testarr2 = [ 
            {"250000000": "OK"},
            {"260000000": "INSUFFICIENT_PAYER_BALANCE"}
        ]; 

        // create a first test account that will be used as the funding account for a second test account
        await setFundingAccount(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
        // allocate an initial balance of 5 HBAr to the funding account
        await createAccountAsFundingAccount(500000000);

        // create a second test account that will be funded by the first test account
        let testAccountPvtKey = await getPvtKey();
        let testAccountId = await getId();
        await setFundingAccount(testAccountId, testAccountPvtKey);
       
        // Select key value pairs from test array 2
        for (var j = 0; j < testarr2.length; j++){
            var obj = testarr2[j];
            for (var key in obj){
                var value = obj[key];
            }
            // CreateAccount with the JSON-RPC
            try {
                let testAcctPublicKey = await generateAccountKey();

                console.log("\n" + (j + 1) + ". Test to create account with initialBalnce = " + key);
                let testAcctID = await createTestAccount(testAcctPublicKey, key);

                // If error is not thrown then check if account has been created 
                // and has the amount of tinyBar set by the key pair, using the JS SDK Client
                let testAcctBal = await getBalanceFromTestnet(testAcctID); 
                let accountBalanceTinybars  = convertToTinybar(testAcctBal); 

                // console.log("testAcctBal " + accountBalanceTinybars + "\n");
                expect(accountBalanceTinybars).to.equal(BigInt(Number(parseInt(key))));
                console.log((j+1) + ": OK " + value);

            } catch(err) {
                // If error is thrown then check error message contains the expected value from 
                // the key value pairs
                assert.include(err.message, value, 'error message contains value substring');
                console.log((j+1) + ": ERR " + value);
            }                
        }     
    })  
        
    function convertToTinybar(hbarVal) {
        // transforms Hbar to Tinybar at ratio 1: 100,000,000
       let tinybarVal = BigInt(Number(hbarVal.hbars._valueInTinybar))
       return tinybarVal;
    }
});
