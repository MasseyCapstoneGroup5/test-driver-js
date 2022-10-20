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
  // CreateAccount with the JSON-RPC, initial balance defaults to 10,000,000,000 tinybars (100 Hbar) 
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    initialBalance: initialBal,
  })
  return response.accountId
}

export async function createAliasAccount(operator_id, aliasAccountId, initialBalance) {
  // Create alias account with the JSON-RPC 
  const response = await JSONRPCRequest('createAccountFromAlias', {
    operator_id: operator_id,
    aliasAccountId: aliasAccountId,
    initialBalance: initialBalance
  })
  return response
}

export async function createAccountReceiverSignature(publicKey, privateKey, initialBalance, isRequired) {
  // Create account with the JSON-RPC that requires owing account to sign for deposits into it
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    privateKey: privateKey,
    initialBalance: initialBalance,
    receiverSignatureRequired: isRequired
  })
  return response.accountId
}

export async function createTestAccountNoKey() {
  // Try to create account with the JSON-RPC without providing a PublicKey
  return await JSONRPCRequest('createAccount', {})
}

export async function createAccountStakedId(publicKey, stakedAccountId) {
  // Create account with the JSON-RPC that includes a staked account Id
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    stakedAccountId: stakedAccountId,
  })
  return response.accountId
}

export async function createAccountStakedNodeId(publicKey, stakedNodeId) {
  // Create account with the JSON-RPC that includes a staked node Id
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    stakedNodeId: stakedNodeId,
  })
  return response.accountId
}

export async function createAccountWithStakedAccountAndNodeIds(
  // Create account with the JSON-RPC that includes both a staked account Id and staked node Id
  publicKey,
  stakedAccountId,
  stakedNodeId
) {
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
  // Create acount with the JSON-RPC that declines rewards for staking
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    declineStakingReward: condition,
  })
  return response.accountId
}

export async function createAccountMemo(publicKey, memo) {
  // Create account with the JSON-RPC that includes a memo in the memo field
  const response = await JSONRPCRequest('createAccount', {
    publicKey: publicKey,
    accountMemo: memo,
  })
  return response.accountId
}

export async function getNodeType(useNode) {
  // check if tests are running or local node or testnet
  if(useNode=='local') return true
  else if(useNode=='testnet') return false
  else { 
    console.warn("Uncaught Node Type Error: the argument is not a node") 
  }
}
