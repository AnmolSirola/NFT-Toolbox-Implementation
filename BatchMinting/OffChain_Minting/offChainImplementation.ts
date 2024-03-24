const Web3 = require('web3')
const MyNFT = require('./MyNFT.json')

const web3 = new Web3('http://localhost:8545') // replace this URL with the Ethereum node URL
const myNFTContract = new web3.eth.Contract(
  MyNFT.abi,
  'With out abi'
)

async function offChain(recipients, tokenIds) {
  const batchSize = 10 // number of NFTs to mint in each transaction, let it be 10 here.
  const numBatches = Math.ceil(
    recipients.length / batchSize
  )
  for (let i = 0; i < numBatches; i++) {
    const start = i * batchSize
    const end = Math.min(
      (i + 1) * batchSize,
      recipients.length
    )
    const batchRecipients = recipients.slice(
      start,
      end
    )
    const batchTokenIds = tokenIds.slice(
      start,
      end
    )
    await myNFTContract.methods
      .batchMint(batchRecipients, batchTokenIds)
      .send({ from: '<Our Ethereum address>' })
  }
}

// example usage
const recipients = [
  'Address 1 of recipient',
  'Address 2 of recipient',
  'Address 3 of recipient',
]
const tokenIds = [0, 1, 2]
await batchMint(recipients, tokenIds)
