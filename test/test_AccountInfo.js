
import {JSONRPClient} from "../client.js";
import {Client, AccountBalanceQuery, AccountInfoQuery} from "@hashgraph/sdk";
import {assert, expect} from "chai";
import {main} from "../tck_main.js";


it('should create account', async function () {

    // Generate new private & public key
    let newPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
    let newPublicKey = await JSONRPClient.request("generatePublicKey", {
            "privateKey": newPrivateKey
    });

    // CreateAccount with the JSON-RPC
    let newAccountId = await JSONRPClient.request("createAccount", {
        "publicKey": newPublicKey
    });

    // Check if account has been created and has at least 1 tinyBar using the JS SDK Client
    const SDKClient = Client.forTestnet();
    SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
    const accountInfo = await new AccountInfoQuery()
        .setAccountId(newAccountId)
        .execute(SDKClient);

}).timeout(10000); // TODO: Better timeout functionality (use callback done)
// Test parameters
// Ensure account id is equal
it('should return true'), async function () {
    assert.strictEqual(accountInfo.accountId, newAccountId);
};

it('should return true'), async function () {
    testNum = 001;
    assert.notEqual(accountInfo.accountId, testNum);
};

it('should return false'), async function () {
    testNum = 001;
    assert.equal(accountInfo.accountId, testNum);
};

// Edge case section
// test whether the account is deleted or not
it("should return false"), async function () {
    assert.strictEqual(accountInfo.isDeleted, false);
};

    //accountinfo parameters
    /*
    accountID, //string
    contractAccountID, //string
    isDeleted, //boolean
    proxyAccountID, //string
    key, //string
    balance, //string
    sendRecordThreshold, //string
    receiveRecordThreshold, //string
    isReceiverSignatureRequired, //boolean
    expirationTime, //string
    autoRenewPeriod, //string
    accountMemo, //string
    ownedNFTs, //string
    maxAutomaticTokenAssociations, //string
    aliasKey, //string
    ledgerID, //string
    ethereumNonce, //string
    stakingInfo, //staking info json
    */
