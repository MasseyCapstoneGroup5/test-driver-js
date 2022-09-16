import {JSONRPClient} from "./client.js";

let genPrivateKey;
let id;

export async function generateAccountKey() {
    // Generate new private & public key
    genPrivateKey = await JSONRPClient.request("generatePrivateKey", {})
    let genPublicKey = await JSONRPClient.request("generatePublicKey", {
        "privateKey": genPrivateKey
    })    
    return genPublicKey;    
};

export async function createTestAccount(publicKey, initialBal) {   
    // CreateAccount with the JSON-RPC 
    let accountId = await JSONRPClient.request("createAccount", {
        "publicKey": publicKey,
        "initialBalance": initialBal
    })
    return accountId;    
};

export async function setFundingAccount(id, pvtkey) {   
    // sets funding and fee-paying account for CRUD ops
    await JSONRPClient.request("setup", {
        "operatorAccountId": id,
        "operatorPrivateKey": pvtkey
    })    
};

export async function createAccountAsFundingAccount(initBal) {  
    // creates a test account with new public and private key
    let publicKey = await generateAccountKey();
    id = await createTestAccount(publicKey, initBal);
    await JSONRPClient.request("setup", {
        "operatorAccountId": id,
        "operatorPrivateKey": genPrivateKey
    })    
};

export async function getPvtKey() {
    return genPrivateKey;
}
export async function getId() {
    return id;
}
