const Web3 = require('web3');
const TokenBatchMinting = require('./TokenBatchMinting.json'); // Assuming you have the ABI for the contract

const web3 = new Web3('http://localhost:8545'); // Replace this URL with your Ethereum node URL
const tokenBatchMintingContract = new web3.eth.Contract(
  TokenBatchMinting.abi,
  '0xContractAddress' // Replace this with the deplyed contract address
);

async function addTokenData(tokenId, tokenName, owner) {
  await tokenBatchMintingContract.methods
    .addTokenData(tokenId, tokenName, owner)
    .send({ from: '<Our Ethereum address>' }); 
}

async function setMerkleRoot(merkleRoot) {
  await tokenBatchMintingContract.methods
    .setMerkleRoot(merkleRoot)
    .send({ from: '<Our Ethereum address>' }); 
}

async function verifyTokenData(tokenId, tokenName, owner, proof) {
  return await tokenBatchMintingContract.methods
    .verifyTokenData(tokenId, tokenName, owner, proof)
    .call();
}

async function verifyMerkleProof(root, leaf, proof) {
  return await tokenBatchMintingContract.methods
    .verifyMerkleProof(root, leaf, proof)
    .call();
}

// Example usage
const tokenId = 0;
const tokenName = "MyNFT";
const owner = '0xOwnerAddress'; // Replace with the owner's Ethereum address
const proof = ['0xProofElement1', '0xProofElement2', '0xProofElement3']; // Example proof array

// Adding token data
await addTokenData(tokenId, tokenName, owner);

// Setting Merkle root
const merkleRoot = '0xMerkleRootHash'; // Replace with the actual Merkle root
await setMerkleRoot(merkleRoot);

// Verifying token data
const isValid = await verifyTokenData(tokenId, tokenName, owner, proof);
console.log('Token data validity:', isValid);

// Verifying Merkle proof
const root = '0xRootHash'; // Replace with the actual root hash
const leaf = '0xLeafHash'; // Replace with the actual leaf hash
const isProofValid = await verifyMerkleProof(root, leaf, proof);
console.log('Merkle proof validity:', isProofValid);
