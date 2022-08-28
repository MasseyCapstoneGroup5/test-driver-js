import {Client, AccountInfoQuery, AccountBalanceQuery} from "@hashgraph/sdk";

export async function getBalanceFromTestnet(accountID) {
    // Use the JS SDK Client to retrieve account information
    const SDKClient = Client.forTestnet();
    SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
    const accountBalance = new AccountBalanceQuery()
    .setAccountId(accountID)
    .execute(SDKClient);   

    return accountBalance;    
};

export async function getInfoFromTestnet(accountID) {
    // Use the JS SDK Client to retrieve account information
    const SDKClient = Client.forTestnet();
    SDKClient.setOperator(process.env.OPERATOR_ACCOUNT_ID, process.env.OPERATOR_ACCOUNT_PRIVATE_KEY);
    const accountInfo = new AccountInfoQuery()
    .setAccountId(accountID)
    .execute(SDKClient);   

    return accountInfo;    
};
