import {JSONRPCRequest} from "./client.js";
import {AccountId, TokenCreateTransaction, AccountAllowanceApproveTransaction, PrivateKey} from "@hashgraph/sdk";
// Token transactions
// Exports to CreateAccount tests to create tokens
export async function createTokenTransaction(accountId){
    const autoRenewAccountId = new AccountId(10);
    const treasuryAccountId = new AccountId(11);
    const transaction = new TokenCreateTransaction()
            .setMaxTransactionFee(new Hbar(30))
            .setTransactionId(accountId)
            .setTokenName("name")
            .setTokenSymbol("symbol")
            .setTokenMemo("memo")
            .setDecimals(7)
            .setTreasuryAccountId(treasuryAccountId)
            .setAutoRenewAccountId(autoRenewAccountId)
            .setNodeAccountIds([new AccountId(4)])
            .setTransactionMemo("random memo")
            return transaction;
}
/*
export async function accountallowanceApproveTransaction(accountId){
    let transaction = new AccountAllowanceApproveTransaction()
            .setTransactionId(
                TransactionId.withValidStart(spenderAccountId1, timestamp1)
            )
            .setNodeAccountIds([nodeAccountId])
            .approveHbarAllowance(ownerAccountId, spenderAccountId1, hbarAmount)
            .approveTokenAllowance(
                tokenId1,
                ownerAccountId,
                spenderAccountId1,
                tokenAmount
            )
            .approveTokenNftAllowance(nftId1, ownerAccountId, spenderAccountId1)
            .approveTokenNftAllowance(nftId2, ownerAccountId, spenderAccountId1)
            .approveTokenNftAllowance(nftId2, ownerAccountId, spenderAccountId2)
            .approveTokenNftAllowanceAllSerials(
                tokenId1,
                ownerAccountId,
                spenderAccountId1
            )
}

export async function createTransaction(accountId){

    let {privateKey} = await generateAccountKeys();

    const timestamp1 = new Timestamp(14, 15);
    let transaction = new AccountCreateTransaction()
            .setTransactionId(
                TransactionId.withValidStart(accountId, timestamp1)
            )
            .setAliasKey(privateKey.publicKey)
            .setNodeAccountIds([nodeAccountId])

}
*/
