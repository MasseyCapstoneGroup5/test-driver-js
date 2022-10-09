import { JSONRPCRequest } from '../../client.js'
import { getAccountInfo } from '../../SDKEnquiry.js'
import { getJsonData } from '../../mirrorNodeEnquiry.js'
import {
  createAccountAsFundingAccount,
  createTestAccount,
  createAccountReceiverSignature,
  createTestAccountNoKey,
  createTestAccountInvalidKey,
  createAccountStakedId,
  createAccountStakedNodeId,
  createAccountWithStakedAccountAndNodeIds,
  createAccountDeclineRewards,
  generateAccountKeys,
  setFundingAccount,
  createAccountMemo,
} from '../../generateNewAccount.js'
import crypto from 'crypto'
import { assert, expect } from 'chai'
import { AccountId, ContractFunctionSelector } from '@hashgraph/sdk'

let publicKey
/**
 * Test Create account and compare results with js SDK
 */
describe('#createAccount()', function () {
  this.timeout(15000)

  before(async function () {
    await setFundingAccount(
      process.env.OPERATOR_ACCOUNT_ID,
      process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
    )
    ;({ publicKey } = await generateAccountKeys())
  })
  after(async function () {
    await JSONRPCRequest('reset')
  })

  //----------- Key is needed to sign each transfer -----------
  describe('Key signature for each transfer', function () {
    // Create a new account
    it('Creates an account', async function () {
      // initiate request for JSON-RPC server to create a new account
      const newAccountId = await createTestAccount(publicKey)
      // query account via consensus node to verify creation
      const accountInfoFromConsensusNode = await getAccountInfo(newAccountId)        
      const accountIDFromConsensusNode = accountInfoFromConsensusNode.accountId.toString()

      // query account via mirror node to confirm availability after creation
      const accountInfoFromMirrorNode = await getJsonData(accountIDFromConsensusNode)
      const accountIDFromMirrorNode = accountInfoFromMirrorNode.accounts[0].account

      // confirm pass status with assertion testing for account creation
      expect(newAccountId).to.equal(accountIDFromConsensusNode)
      expect(newAccountId).to.equal(accountIDFromMirrorNode)
    })
    // Create an account with no public key
    it('Creates an account with no public key', async function () {
      /**
       * Key not provided in the transaction body
       * KEY_REQUIRED = 26;
       **/
      try {
        // request JSON-RPC server to try to create a new account without a public key
        await createTestAccountNoKey()
      } catch (err) {
        // confirm error thrown for creation attempt without provision of public key
        assert.equal(err.code, 26, 'error code is KEY_REQUIRED')
      }
    })
    // Create an account with an invalid public key
    it('Creates an account with an invalid public key', async function () {
      try {
        // generate a random key value of 88 bytes (where 88b is equal to byte length of valid public key)
        const invalidPublicKey = crypto.randomBytes(88).toString()
        // request JSON-RPC server to try to create a new account with invalid public key
        await createTestAccountInvalidKey(invalidPublicKey)
      } catch (err) {
        // confirm error thrown for creation attempt with an invalid public key
        assert.equal(err.code, 0, 'error code 0 thrown')
      }
    })
    // Set initial balance to -100 HBAR
    it('Sets initial balance to -1000 HBar', async function () {
      /**
       * Attempt to set negative initial balance
       * INVALID_INITIAL_BALANCE = 85;
       **/
      try {
        // set a negative initial balance of minus 1000 HBars
        let initialBalance = 1000
        // convert Hbar to Tinybar at ratio 1: 100,000,000
        let negativeInitialBalance = initialBalance *= -100000000
        await createTestAccount(publicKey, negativeInitialBalance)
      } catch (err) {
        // confirm error thrown for creation attempt using a negative initial balance amount
        assert.equal(
          err.code,
          '85',
          'error code 85 for INVALID_INITIAL_BALANCE'
        )
      }
    })
    // Set the initial balance to more than operator balance
    it('Sets initial balance to more than operator balance', async function () {
      /**
       * The payer account has insufficient cryptocurrency to pay the transaction fee
       * INSUFFICIENT_PAYER_BALANCE = 10;
       **/
      const initialBalance = 500000000
      const payerBalance = 500000001
      // create a first test account that will be used as the funding account for a second
      // test account. Allocate an initial balance of 5 HBAr to the funding account
      await createAccountAsFundingAccount(initialBalance)
      try {
        await createTestAccount(publicKey, payerBalance)
      } catch (err) {
        // confirm error thrown for creation attempt where initial balance is more than the
        // balance held in the funding account balance
        assert.equal(
          err.code,
          '10',
          'error code 10 for INSUFFICIENT_PAYER_BALANCE'
        )
      }
    })
  })
  //-----------  Account key signs transactions depositing into account -----------
  // Require a receiving signature when creating account transaction
  describe('Account key signatures to deposit into account', function () {
    it('Creates account transaction and returns Receiver signature required to true', async function () {
      // Creates new account transaction that doesn't require a signature 
      try {
        const receiverSignatureRequired = false
        await createAccountReceiverSignature(publicKey, receiverSignatureRequired)
      } catch (err) {
        console.log(err.message);
       // assert.equal(err.code, '322', 'error code 322 for INVALID_STAKING_ID ')
      }
    })

    it('Creates new account transaction without Receiver signature required', async function () {})
  })
  //----------- Maximum number of tokens that an Account be associated with -----------
  describe('Max Token Association', function () {
    // Creates an account with a default max token association
    //The accounts maxAutomaticTokenAssociations can be queried on the consensus node with AccountInfoQuery
    it('Creates an account with a default max token association', async function () {
      await setFundingAccount(
        process.env.OPERATOR_ACCOUNT_ID,
        process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
      )
      let { publicKey } = await generateAccountKeys()
      const receipt = await JSONRPCRequest('createAccountAllProperties', {
        publicKey: publicKey,
        initialBalance: 0,
        maxAutomaticTokenAssociations: 0,
      })
      let newAccountId = new AccountId(receipt.accountId).toString()
      let accInf = await getAccountInfo(newAccountId)
      assert.equal(accInf.maxAutomaticTokenAssociations, 0)
    })
    // Creates an account with max token set to the maximum
    it('Max token set to the maximum', async function () {
      await setFundingAccount(
        process.env.OPERATOR_ACCOUNT_ID,
        process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
      )
      let { publicKey } = await generateAccountKeys()
      const receipt = await JSONRPCRequest('createAccountAllProperties', {
        publicKey: publicKey,
        initialBalance: 0,
        maxAutomaticTokenAssociations: 10,
      })
      let newAccountId = new AccountId(receipt.accountId).toString()
      let accInf = await getAccountInfo(newAccountId)
      assert.equal(accInf.maxAutomaticTokenAssociations, 100)
    })
    // Create an account with token association over the max
    it('Max token association over the maximum', async function () {
      try {
        await setFundingAccount(
          process.env.OPERATOR_ACCOUNT_ID,
          process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
        )
        let { publicKey } = await generateAccountKeys()
        const receipt = await JSONRPCRequest('createAccountAllProperties', {
          publicKey: publicKey,
          initialBalance: 0,
          maxAutomaticTokenAssociations: 2000,
        })
      } catch (err) {
        assert.equal(err.code, '9', 'INSUFFICIENT_TX_FEE')
      }
    })
    // Create an account with a max token association of -1
    it('Max token association of -1', async function () {
      await setFundingAccount(
        process.env.OPERATOR_ACCOUNT_ID,
        process.env.OPERATOR_ACCOUNT_PRIVATE_KEY
      )
      let { publicKey } = await generateAccountKeys()
      const receipt = await JSONRPCRequest('createAccountAllProperties', {
        publicKey: publicKey,
        initialBalance: 0,
        maxAutomaticTokenAssociations: -1,
      })
      let newAccountId = new AccountId(receipt.accountId).toString()
      let accInf = await getAccountInfo(newAccountId)
      assert.equal(accInf.maxAutomaticTokenAssociations, -1)
    })
  })
  //----------- Staked ID - ID of the account to which is staking --------------------
  describe('Staked ID, ID of account to which is staking', async function () {
    // Create an account and set staked account ID to operator account ID
    it('Creates an account and sets staked account ID to operator account ID', async function () {
      const newAccountId = await createAccountStakedId(
        publicKey,
        process.env.OPERATOR_ACCOUNT_ID
      )

      // query account via consensus node to verify creation
      const accountInfoFromConsensusNode = await getAccountInfo(newAccountId)
      const accountID = accountInfoFromConsensusNode.accountId.toString()
      const stakedIDFromConsensusNode =
        accountInfoFromConsensusNode.stakingInfo.stakedAccountId.toString()

      // query account via mirror node to confirm availability after creation
      const respJSON = await getJsonData(accountID)
      const stakedIDFromMirrorNode = respJSON.accounts[0].staked_account_id

      // confirm pass status with testing for account creation with a set staked account ID
      expect(stakedIDFromConsensusNode).to.equal(
        process.env.OPERATOR_ACCOUNT_ID
      )
      expect(stakedIDFromMirrorNode).to.equal(process.env.OPERATOR_ACCOUNT_ID)
    })
    // Create an acount and set staked node ID and a node ID
    it('Creates an account and sets staked node ID and a node ID', async function () {
      // select a staked node id betwen 0 and 6 for the test
      const randomNodeId = Math.floor(Math.random() * 6) + 1
      const newAccountId = await createAccountStakedNodeId(
        publicKey,
        randomNodeId
      )

      // query account via consensus node to verify creation
      const accountInfoFromConsensusNode = await getAccountInfo(newAccountId)
      const accountID = accountInfoFromConsensusNode.accountId.toString()
      const stakedNodeIDFromConsensusNode =
        accountInfoFromConsensusNode.stakingInfo.stakedNodeId.low.toString()

      // query account via mirror node to confirm availability after creation
      const respJSON = await getJsonData(accountID)
      const stakedNodeIDFromMirrorNode = respJSON.accounts[0].staked_node_id

      // confirm pass status with testing for account creation with a set staked node ID
      expect(Number(stakedNodeIDFromConsensusNode)).to.equal(randomNodeId)
      expect(Number(stakedNodeIDFromMirrorNode)).to.equal(randomNodeId)
    })
    // Create an account and set the staked account ID to an invalid ID
    it('Creates an account and sets the staked account ID to an invalid ID', async function () {
      /**
       * The staking account id or staking node id given is invalid or does not exist.
       * INVALID_STAKING_ID = 322;
       **/
      try {
        const invalidStakedId = '9.9.999999'
        await createAccountStakedId(publicKey, invalidStakedId)
      } catch (err) {
        assert.equal(err.code, '322', 'error code 322 for INVALID_STAKING_ID ')
      }
    })
    // Create an account and set the staked node ID to an invalid node
    it('Creates an account and sets the staked node ID to an invalid node', async function () {
      /**
       * The staking account id or staking node id given is invalid or does not exist.
       * INVALID_STAKING_ID = 322;
       **/
      try {
        // select a staked node id greater than 6 for the test
        const invalidNodeId = 10
        await createAccountStakedNodeId(publicKey, invalidNodeId)
      } catch (err) {
        assert.equal(err.code, '322', 'error code 322 for INVALID_STAKING_ID ')
      }
    })
    // Create an account and set staked account ID with no input
    it('Creates an account and sets staked account ID with no input', async function () {
      try {
        // select a staked node id greater than 6 for the test
        const noInputStakedId = ''
        await createAccountStakedId(publicKey, noInputStakedId)
      } catch (err) {
        // confirm error thrown for creation attempt with no input provided for staked account ID
        assert.equal(err.code, 0, 'error code 0 thrown')
      }
    })
    // Create an account and set the staked node ID with no input
    it('Creates an account and sets the staked node ID with no input', async function () {
      try {
        // select a staked node id greater than 6 for the test
        const noInputNodeId = ''
        await createAccountStakedNodeId(publicKey, noInputNodeId)
      } catch (err) {
        // confirm error thrown for creation attempt with no input provided for staked node ID
        assert.equal(err.code, 0, 'error code 0 thrown')
      }
    })
    // Create an account and set both a staking account ID and node ID
    it('Creates an account and sets both a staking account ID and node ID', async function () {
      // set staked account ID to operator account ID
      const stakedAccountId = process.env.OPERATOR_ACCOUNT_ID

      // select a staked node id betwen 0 and 6 for the test
      const stakedNodeId = Math.floor(Math.random() * 6) + 1

      // initiate request for JSON-RPC server to create a new account with both StakedAccountId and StakedNodeId
      const newAccountId = await createAccountWithStakedAccountAndNodeIds(
        publicKey,
        stakedAccountId,
        stakedNodeId
      )
      // query account via consensus node to verify creation
      const accountInfoFromConsensusNode = await getAccountInfo(newAccountId)
      const accountID = accountInfoFromConsensusNode.accountId.toString()
      const stakedAccountIDFromConsensusNode =
        accountInfoFromConsensusNode.stakingInfo.stakedAccountId
      const stakedNodeIDFromConsensusNode =
        accountInfoFromConsensusNode.stakingInfo.stakedNodeId.low

      // query account via mirror node to confirm availability after creation
      const respJSON = await getJsonData(accountID)
      const stakedAccountIDFromMirrorNode = respJSON.accounts[0].staked_account_id
      const stakedNodeIDFromMirrorNode = respJSON.accounts[0].staked_node_id

      // confirm pass status with testing for account creation with staked node id set to random between 0 and 6,
      // note: Hedera network does not permit setting of both, so will reject staked account id
      // to a null value)
      expect(stakedAccountIDFromConsensusNode).to.equal(null)
      expect(stakedAccountIDFromMirrorNode).to.equal(null)
      expect(stakedNodeIDFromConsensusNode).to.equal(stakedNodeId)
      expect(stakedNodeIDFromMirrorNode).to.equal(stakedNodeId)
    })
  })
  //----------- If true - account declines receiving a staking reward -----------
  describe('Account declines receiving a staking reward', async function () {
    // Create an account and set the account to decline staking rewards
    it('Creates an account and set the account to decline staking rewards', async function () {
      const newAccountID = await createAccountDeclineRewards(publicKey, true)

      // Query the consensus node
      const cNodeQuery = await getAccountInfo(newAccountID)
      const cNodeRes = cNodeQuery.stakingInfo.declineStakingReward

      // Query the mirror node
      const mNodeQuery = await getJsonData(newAccountID)
      const mNodeRes = mNodeQuery.accounts[0].decline_reward

      expect(cNodeRes).to.be.true
      expect(mNodeRes).to.be.true
    })
    // Create an account and leave decline rewards at default value
    it('Creates an account and leave staking rewards at default value', async function () {
      const newAccountID = await createTestAccount(publicKey)

      // first query consensus node
      const cNodeQuery = await getAccountInfo(newAccountID)
      const cNodeRes = cNodeQuery.stakingInfo.declineStakingReward

      // Query the mirror node
      const mNodeQuery = await getJsonData(newAccountID)
      const mNodeRes = mNodeQuery.accounts[0].decline_reward

      expect(cNodeRes).to.be.false
      expect(mNodeRes).to.be.false
    })
    // Create an account set the decline rewards value to 5
    it('Creates an account and set the decline rewards value to 5', async function () {
      let err = false
      try {
        const newAccountID = await createAccountDeclineRewards(publicKey, 5)
      } catch (error) {
        err = true
      }
      expect(err, 'The test should error').to.be.true
    })
  })

  describe('Create accounts with a memo', async function () {
    // Create an account with a memo
    it('Creates an account with a memo', async function () {
      let testMemo = 'testMemo'
      const newAccountID = await createAccountMemo(publicKey, testMemo)

      // First query consensus node
      const cNodeQuery = await getAccountInfo(newAccountID)
      const cNodeRes = cNodeQuery.accountMemo

      // Query the mirror node
      const mNodeQuery = await getJsonData(newAccountID)
      const mNodeRes = mNodeQuery.accounts[0].memo

      expect(cNodeRes).to.equal(testMemo)
      expect(mNodeRes).to.equal(testMemo)
    })
    // Create an account with a memo that exceeds 100 characters
    it('Creates an account with a memo exceeding 100 characters', async function () {
      const testMemo =
        'testMemo12testMemo12testMemo12testMemo12testMemo12testMemo12testMemo12testMemo12testMemo12testMemo123' // 101 characters
      let err = false
      try {
        const newAccountID = await createAccountMemo(publicKey, testMemo)
      } catch (error) {
        err = true
      }
      expect(err, 'The test should throw an error').to.be.true
    })
  })

  return Promise.resolve()
})
