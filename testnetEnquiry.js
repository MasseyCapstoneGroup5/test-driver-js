import {Client, AccountInfoQuery, AccountBalanceQuery} from "@hashgraph/sdk";

export async function getBalanceFromTestnet(accountID) {
    const accountBalance = getTestnet(accountID, new AccountBalanceQuery())

    return accountBalance;    
};

export async function getInfoFromTestnet(accountID) {
    const accountInfo = getTestnet(accountID, new AccountInfoQuery()) 

    return accountInfo;    
};

async function getTestnet(accountID, method) {
    // Use the JS SDK Client to retrieve account information
    const SDKClient = Client.forTestnet();
    SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
    const query = await method
    .setAccountId(accountID)
    .execute(SDKClient);   

    return query;
}
