import fetch from "node-fetch";

export async function getJsonData(accountid) {
    /**
     * Allow a set period of time (max 10s) for data to be added or updated on the Hedera network
     * before querying the Hedera mirror node to check and verify the data 
    **/
    const timedelay = await getDelayTime(process.env.NODE_TYPE)
    await delay(timedelay);
    let url = `${process.env.MIRROR_NODE_REST_URL}/api/v1/accounts?account.id=${accountid}`;
    const response = await fetch(url);
    return await response.json();
}

 async function getDelayTime(nodetype) {    
    // check if tests are running or local node or testnet
    if(nodetype=='local') {
      return 2000
    } 
    else { return 8000 } 
  }

  function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
