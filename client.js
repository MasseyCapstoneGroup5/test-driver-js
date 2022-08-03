import { JSONRPCClient } from "json-rpc-2.0";
import fetch from "node-fetch";

// JSONRPCClient needs to know how to send a JSON-RPC request.
// Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
const client = new JSONRPCClient((jsonRPCRequest) =>
  fetch("http://localhost", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(jsonRPCRequest),
  }).then((response) => {
    if (response.status === 200) {
      // Use client.receive when you received a JSON-RPC response.
      return response
        .json()
        .then((jsonRPCResponse) => client.receive(jsonRPCResponse));
    } else if (jsonRPCRequest.id !== undefined) {
      return Promise.reject(new Error(response.statusText));
    }
  })
);

// Use client.request to make a JSON-RPC request call.
// The function returns a promise of the result.
client
  .request("setup", {  
        "operatorAccountId": "0.0.47753800",
        "operatorPrivateKey": "302e020100300506032b657004220420ffb35a1405620c245d041b9b0e31a2c1b17b4be0df9c570c445b425335f87c2b"
    }
   )
  .then((result) => console.log(result));

