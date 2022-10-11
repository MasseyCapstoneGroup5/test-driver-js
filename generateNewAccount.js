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

export async function createTestAccount(publicKey, initialBal = 10000000000) {
  // CreateAccount with the JSON-RPC, initial balance defaults to 10,000,000,000 tinybars (100Hbar) 
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    initialBalance: initialBal,
  })
  return response.accountId
}

export async function createAccountReceiverSignature(publicKey, privateKey, initialBalance, isRequired){
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    privateKey: privateKey,
    initialBalance: initialBalance,
    receiverSignatureRequired: isRequired
  })
  return response.accountId
}

export async function createTestAccountNoKey() {
  // CreateAccount with the JSON-RPC
  return await JSONRPCRequest('createAccount', {})
}

export async function createAccountStakedId(publicKey, stakedAccountId) {
  // CreateAccount with the JSON-RPC
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    stakedAccountId: stakedAccountId,
  })
  return response.accountId
}

export async function createAccountStakedNodeId(publicKey, stakedNodeId) {
  // CreateAccount with the JSON-RPC
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    stakedNodeId: stakedNodeId,
  })
  return response.accountId
}

export async function createAccountWithStakedAccountAndNodeIds(
  publicKey,
  stakedAccountId,
  stakedNodeId
) {
  // CreateAccount with the JSON-RPC
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    stakedAccountId: stakedAccountId,
    stakedNodeId: stakedNodeId,
  })
  return response.accountId
}

export async function setFundingAccount(accountId, privateKey) {
  // sets funding and fee-paying account for CRUD ops
  await JSONRPCRequest('setup', {
    operatorAccountId: accountId,
    operatorPrivateKey: privateKey,
    nodeIp: process.env.NODE_IP,
    nodeAccountId: process.env.NODE_ACCOUNT_ID,
    mirrorNetworkIp: process.env.MIRROR_NETWORK,
  })
}

export async function createAccountAsFundingAccount(initialBalance) {
  // creates a new test account with new public and private key
  const { publicKey, privateKey } = await generateAccountKeys()
  const accountId = await createTestAccount(publicKey, initialBalance)
  await setFundingAccount(accountId, privateKey)
  return {
    accountId: accountId,
    publicKey: publicKey,
    privateKey: privateKey,
  }
}

export async function createAccountDeclineRewards(publicKey, condition) {
  // CreateAccount with the JSON-RPC
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    declineStakingReward: condition,
  })
  return response.accountId
}

export async function createAccountMemo(publicKey, memo) {
  // CreateAccount with the JSON-RPC
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    accountMemo: memo,
  })
  return response.accountId
}

