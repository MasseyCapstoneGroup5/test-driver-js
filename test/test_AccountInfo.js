
import {JSONRPClient} from "../client.js";
import {Client, AccountInfoQuery} from "@hashgraph/sdk";
import {expect} from "chai";


describe('#accountInfoTest()', function() {
    // Send a setup request to RPC server
    beforeEach(async function () {
        await JSONRPClient.request("setup", {
                "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
                "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
            }
        )
    });

    // TODO: This should be getting an account ID and a private key
    let accountID = await JSONRPClient.request("getAccountInfo", {
        "publicKey": newPublicKey
    });
    // TODO: 
    const SDKClient = Client.forTestnet();
    SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
    
    const accountInfo = await new AccountInfoQuery()
                        .setAccountId(accountID)
                        .execute(SDKClient);

    // TESTS
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

    const account_id = accountInfo.accountId;

    // Ensure account is not deleted if exists.
    expect(accountInfo.isDeleted).toBe(false);

    // ensure account doesn't throw an error.
    expect(accountInfo.accountId).to.not.throw();
    
});
