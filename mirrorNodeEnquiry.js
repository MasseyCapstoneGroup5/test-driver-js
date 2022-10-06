import fetch from "node-fetch";

export async function getJsonData(accountid) {
    /**
     * Allow a set period of time (max 10s) for data to be added or updated on the Hedera network
     * before querying the Hedera mirror node to check and verify the data 
    **/
    await delay(4000);
    let url = `${process.env.MIRROR_NODE_REST_URL}/api/v1/accounts?account.id=${accountid}`;
    const response = await fetch(url);
    return await response.json();
}
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
