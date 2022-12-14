import { JSONRPC, JSONRPCClient } from "json-rpc-2.0";
import fetch from "node-fetch";
import 'dotenv/config'


let nextID = 0;
const createID = () => nextID++;


// JSONRPCClient needs to know how to send a JSON-RPC request.
// Tell it by passing a function to its constructor. The function must take a JSON-RPC request and send it.
const JSONRPClient = new JSONRPCClient((jsonRPCRequest) =>
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
                    .then((jsonRPCResponse) => JSONRPClient.receive(jsonRPCResponse));
            } else if (jsonRPCRequest.id !== undefined) {
                return Promise.reject(new Error(response.statusText));
            }
        }),
    createID()
);

export async function JSONRPCRequest(method, params) {
    const jsonRPCRequest = {
        jsonrpc: JSONRPC,
        id: createID(),
        method: method,
        params: params,
    };

    let jsonRPCResponse = await JSONRPClient.requestAdvanced(jsonRPCRequest);
    if (jsonRPCResponse.error) {
        if (jsonRPCResponse.error.code === -32601){
            console.warn("Method", method, "not found.")
            return {status: "NOT_IMPLEMENTED"}; // The json-rpc hasn't implemented the method
        }
        throw {name: "Error", ...jsonRPCResponse.error}
    } else {
        return jsonRPCResponse.result
    }
}