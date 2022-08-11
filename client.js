import { JSONRPCClient } from "json-rpc-2.0";
import fetch from "node-fetch";
import 'dotenv/config'

// JSONRPCClient needs to know how to send a JSON-RPC request.
// Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
export const client = new JSONRPCClient((jsonRPCRequest) =>
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
      "operatorAccountId": process.env.OPERATOR_ACCOUNT_ID,
      "operatorPrivateKey": process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
    }
   )
  .then((result) => console.log(result));

