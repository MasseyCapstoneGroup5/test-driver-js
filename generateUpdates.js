import {JSONRPCRequest} from "./client.js";

export async function updateAccountKey(accountId, newPublicKey, firstPvtKey, newPvtKey) {
    // sets a new public / private key on an account
    return await JSONRPCRequest("updateAccountKey", {
        "accountId": accountId,
        "newPublicKey": newPublicKey,
        "oldPrivateKey": firstPvtKey,
        "newPrivateKey": newPvtKey
    })
}

export async function updateAccountMemo(newAccountId, newPrivateKey, memostring) {
    // sets a new memo on an account
    return await JSONRPCRequest("updateAccountMemo", {
        "accountId": newAccountId,
        "key": newPrivateKey,
        "memo": memostring
    })
}

export async function updateTokenAllowance(accountId, amount){
    const ownerAccountId = accountId
    const tokenId = new TokenId(1);
    const spenderAccountId = new AccountId(4);
    const tokenAmount = Long.fromNumber(amount);

    const allowance = new TokenAllowance({
        ownerAccountId,
        tokenId,
        spenderAccountId,
        amount: tokenAmount
    })
    return allowance;
}
