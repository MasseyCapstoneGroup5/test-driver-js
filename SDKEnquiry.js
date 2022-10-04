import {AccountBalanceQuery, AccountId, AccountInfoQuery, Client} from "@hashgraph/sdk";

export async function getBalance(accountID) {
    return executeAccountMethod(accountID, new AccountBalanceQuery());
}

export async function getAccountInfo(accountID) {
    return executeAccountMethod(accountID, new AccountInfoQuery());
}

/**
 * Depending on the .env variables the method is executed on the testnet or custom node
 * @param accountID
 * @param method
 * @returns {Promise<*>}
 */
async function executeAccountMethod(accountID, method) {
    // Use the JS SDK Client to retrieve account information
    let SDKClient;
    if (process.env.NODE_IP && process.env.NODE_ACCOUNT_ID && process.env.MIRROR_NETWORK) {
        //Create client
        const node = {[process.env.NODE_IP]: new AccountId(parseInt(process.env.NODE_ACCOUNT_ID))};
        SDKClient = Client.forNetwork(node).setMirrorNetwork(process.env.MIRROR_NETWORK);
    } else {
        // Default to testnet client
        SDKClient = Client.forTestnet();
    }
    SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
    return await method.setAccountId(accountID).execute(SDKClient);
}
