import { JSONRPCRequest } from './client.js'
import { AccountId } from '@hashgraph/sdk'

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

export async function createTestAccount(publicKey, initialBal = 1000) {
  // CreateAccount with the JSON-RPC
  const receipt = await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
    initialBalance: initialBal,
  })
  return new AccountId(receipt.accountId).toString()
}

export async function createAccountReceiverSignature(publicKey, initialBalance, isRequired){ 
  return await JSONRPCRequest('createAccountRequiresSignature', {
    publicKey: publicKey,
    initialBalance: initialBalance,
    receiverSignatureRequired: isRequired
  })
}

export async function createTestAccountNoKey() {
  // CreateAccount with the JSON-RPC
  return await JSONRPCRequest('createAccountAllProperties', {})
}

export async function createTestAccountInvalidKey(publicKey) {
  // CreateAccount with the JSON-RPC
  return await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
  })
}

export async function createAccountStakedId(publicKey, stakedAccountId) {
  // CreateAccount with the JSON-RPC
  const receipt = await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
    stakedAccountId: stakedAccountId,
  })
  return new AccountId(receipt.accountId).toString()
}

export async function createAccountStakedNodeId(publicKey, stakedNodeId) {
  // CreateAccount with the JSON-RPC
  const receipt = await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
    stakedNodeId: stakedNodeId,
  })
  return new AccountId(receipt.accountId).toString()
}

export async function createAccountWithStakedAccountAndNodeIds(
  publicKey,
  stakedAccountId,
  stakedNodeId
) {
  // CreateAccount with the JSON-RPC
  const receipt = await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
    stakedAccountId: stakedAccountId,
    stakedNodeId: stakedNodeId,
  })
  return new AccountId(receipt.accountId).toString()
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
  const receipt = await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
    declineStakingReward: condition,
  })
  return new AccountId(receipt.accountId).toString()
}

export async function createAccountMemo(publicKey, memo) {
  // CreateAccount with the JSON-RPC
  const receipt = await JSONRPCRequest('createAccountAllProperties', {
    publicKey: publicKey,
    accountMemo: memo,
  })
  return new AccountId(receipt.accountId).toString()
}
