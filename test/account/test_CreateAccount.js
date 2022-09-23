import {JSONRPCRequest} from "../../client.js";
import {getBalanceFromTestnet} from "../../testnetEnquiry.js";
import {
    createAccountAsFundingAccount,
    createTestAccount,
    generateAccountKeys,
    setFundingAccount
} from "../../generateNewAccount.js";
import {assert, expect} from "chai";

/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
    this.timeout(15000);

    after(async function () {
        await JSONRPCRequest("reset")
    });

    it('should test invalid initial balance', async function () {
        /**
         * Attempt to set negative initial balance
         * INVALID_INITIAL_BALANCE = 85;
         **/ 
        // test array could potentially be a json file stored with key value pairs, E.g.
        const testarr1 = {
            "0": "OK",
            "1": "OK",
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
                // console.log("Error mssge: " + err.message + ". Expected val: " + value);
                // console.log("Error code: " + err.code);
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
                // If error is thrown then check error message contains the expected value from
                // the key value pairs
                assert.equal(err.code, value, 'error code equals value from testarr2');
            }
        }
    })

    function convertToTinybar(hbarVal) {
        // transforms Hbar to Tinybar at ratio 1: 100,000,000
        return BigInt(Number(hbarVal.hbars._valueInTinybar));
    }
});
