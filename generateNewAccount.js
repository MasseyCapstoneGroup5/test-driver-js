import {JSONRPCRequest} from "./client.js";

export async function generateAccountKeys() {
    // Generate new private & public key
    let privateKey = await JSONRPCRequest("generatePrivateKey", {})
    let publicKey = await JSONRPCRequest("generatePublicKey", {
        "privateKey": privateKey
    })    
    return {
        "publicKey": publicKey,
        "privateKey": privateKey
    };
}

export async function createTestAccount(publicKey, initialBal) {
    // CreateAccount with the JSON-RPC
    return await JSONRPCRequest("createAccountAllProperties", {
        "publicKey": publicKey,
        "initialBalance": initialBal
    });
}

export async function createTestAccountNoKey() {
    // CreateAccount with the JSON-RPC
    return await JSONRPCRequest("createAccountAllProperties", {
    });
}

export async function createAccountStakedId(publicKey, initialBalance, stakedAccountId) {
    // CreateAccount with the JSON-RPC
    return await JSONRPCRequest("createAccountAllProperties", {
        "publicKey": publicKey,
        "initialBalance": initialBalance,
        "stakedAccountId": stakedAccountId
    });
}

export async function setFundingAccount(accountId, privateKey) {
    // sets funding and fee-paying account for CRUD ops
    await JSONRPCRequest("setup", {
        "operatorAccountId": accountId,
        "operatorPrivateKey": privateKey
    })
}

export async function createAccountAsFundingAccount(initialBalance) {
    // creates a new test account with new public and private key
    const {publicKey, privateKey} = await generateAccountKeys();
    const accountId = await createTestAccount(publicKey, initialBalance);
    await setFundingAccount(accountId, privateKey)
    return {
        "accountId": accountId,
        "publicKey": publicKey,
        "privateKey": privateKey
    };
}