import {AccountCreateTransaction, TransactionId, Timestamp} from "@hashgraph/sdk";
// Token Related
// creates AccountCreateTransaction query and sets the max automatic token association
export async function createMaxTokenAssociation(max, publicKey, accoundId){
    const accountId = accoundId;
    const validStart = new Timestamp(5, 4);
    let transactionId = new TransactionId(accountId, validStart);

    let transaction = new AccountCreateTransaction()
            .setKey(publicKey)
            .setMaxAutomaticTokenAssociations(max)
            .setTransactionId(transactionId);
    return transaction.maxAutomaticTokenAssociations.toString();
}
