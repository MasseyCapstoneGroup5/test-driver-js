import {AccountCreateTransaction, TransactionId, Timestamp, Client} from "@hashgraph/sdk";
// Token Related
// creates AccountCreateTransaction query and sets the max automatic token association
export async function createMaxTokenAssociation(max, accountId){
    //let transactionId = new TransactionId(accoundId, validStart, false, null);
    const client = Client.forTestnet();
    const transactionId = TransactionId(accountId, 0, false, null);
    return new AccountCreateTransaction()
        .setMaxAutomaticTokenAssociations(max)
        .setTransactionId(transactionId)
        .freezeWith(client);
}
