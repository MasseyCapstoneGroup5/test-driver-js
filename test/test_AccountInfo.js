


async function Test_AccountInfo(
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
    ){

    var missing_args = [];
    let params = [arguments.accountID, arguments.contractAccountID, arguments.isDeleted,
    arguments.proxyAccountID, arguments.key, arguments.balance,
    arguments.balance, arguments.sendRecordThreshold, arguments.receiveRecordThreshold,
    arguments.isReceiverSignatureRequired, arguments.expirationTime,
    arguments.autoRenewPeriod, arguments.accountMemo, arguments.ownedNFTs,
    arguments.maxAutomaticTokenAssociations, arguments.aliasKey,
    arguments.ledgerID, arguments.ethereumNonce, arguments.stakingInfo];
    
    // Map over params list to check if all parameters are strings.
    params.map(x => {
        var expect = require('chai').expect
        expect(x).to.be.a('string');
    })
    // Print lists for testing
    console.log(params);
    console.log(missing_args);

    // TODO: convert to json string
    // if json string does not pass into node and return true - mark unimplemented
    return params;
}

// Input test parameters that will be readily available in the node for testing.
Test_AccountInfo(
    accountID="test accountID", 
    contractAccountID="test contractAccountID",
    isDeleted=false, 
    proxyAccountID="test", 
    key="test", 
    balance="test", 
    sendRecordThreshold="test", 
    receiveRecordThreshold="test", 
    isReceiverSignatureRequired=false, 
    expirationTime="test",
    autoRenewPeriod=true, 
    accountMemo="test", 
    ownedNFTs="test", 
    maxAutomaticTokenAssociations="test", 
    aliasKey="test", 
    ledgerID="test", 
    ethereumNonce="test", 
    stakingInfo="test"
    );