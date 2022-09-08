import {JSONRPClient} from "../../client.js";
import {getBalanceFromTestnet} from "../../testnetEnquiry.js";
import {assert, expect} from "chai";

// test array could potentially be a json file stored with key value pairs, E.g.
const testarr = [ 
                {"-1": "INVALID_INITIAL_BALANCE"}, 
                {"1234567891234": "INSUFFICIENT_PAYER_BALANCE"},
                {"1": "OK"}
            ]; 

let newAccountId;
/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
    this.timeout(10000);
    
        before(async function () {
            await JSONRPClient.request("setup", {
                    "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                    "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
                }
            )
        });
        after(async function () {
            await JSONRPClient.request("reset")
        });

        it('should create account', async function () {
            
            // Generate new private & public key
            let newPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
            let newPublicKey = await JSONRPClient.request("generatePublicKey", {
                "privateKey": newPrivateKey
            });           
            
            // Select key value pairs from test array
            for (var i = 0; i < testarr.length; i++){
                var obj = testarr[i];
                for (var key in obj){
                    var value = obj[key];
                }
                // CreateAccount with the JSON-RPC
                try {
                    console.log((i + 1) + ". Test to create account with initialBalnce = " + key);
                    newAccountId = await JSONRPClient.request("createAccount", {
                        "publicKey": newPublicKey,
                        "initialBalance": parseInt(key)
    
                    })
                    // If error is not thrown then check if account has been created 
                    // and has the amount of tinyBar set by the key pair, using the JS SDK Client
                    let accountBalance = await getBalanceFromTestnet(newAccountId); 
                    let accountBalanceTinybars  = BigInt(Number(accountBalance.hbars._valueInTinybar));
                    // TODO: use Longs correctly instead of converting to Int
                    expect(accountBalanceTinybars).to.equal(BigInt(Number(parseInt(key))));
                    console.log((i+1) + ": " + value);

                } catch(err) {
                    // If error is not thrown then check error message contains the
                    // expected value from the key value pairs
                    // console.log("Error mssge: " + err.message + ". Expected val: " + value);
                    assert.include(err.message, value, 'error message contains value substring');
                    console.log((i+1) + ": " + value);
                }                
            }                
        })         
});
