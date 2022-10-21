import { JSONRPCRequest } from './client.js'

export async function generateAccountKeys() {
  // Generate new private & public key
  let privateKey = await JSONRPCRequest('generatePrivateKey', {})
  let publicKey = await JSONRPCRequest('generatePublicKey', {
    privateKey: privateKey,
  })
  return {
    publicKey: publicKey,
    privateKey: privateKey,
  }
}

export async function setOperator(accountId, privateKey) {
  // sets funding and fee-paying account for CRUD ops
  await JSONRPCRequest('setup', {
    operatorAccountId: accountId,
    operatorPrivateKey: privateKey,
    nodeIp: process.env.NODE_IP,
    nodeAccountId: process.env.NODE_ACCOUNT_ID,
    mirrorNetworkIp: process.env.MIRROR_NETWORK,
  })
}

export async function getNodeType(useNode) {
  // check if tests are running or local node or testnet
  if(useNode=='local') return true
  else if(useNode=='testnet') return false
  else { 
    console.warn("Uncaught Node Type Error: the argument is not a node") 
  }
}
