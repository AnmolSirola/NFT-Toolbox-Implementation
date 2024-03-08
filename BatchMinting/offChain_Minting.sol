const MAX_BATCH_SIZE: number = 1000;
const batchSize: number = 500;
const tokenData: any[] = []; // array of token data to be minted

// Split token data into batches
const batches: any[][] = [];
for (let i: number = 0; i < tokenData.length; i += batchSize) {
  batches.push(tokenData.slice(i, i + batchSize));
}

// Create a Merkle tree for each batch
const merkleTrees: MerkleTree[] = batches.map(batch => new MerkleTree(batch));

// Calculate the Merkle root for each tree
const merkleRoots: string[] = merkleTrees.map(tree => tree.getRoot());

// Store the Merkle roots on the blockchain
for (let i: number = 0; i < merkleRoots.length; i++) {
  const tx = await contract.setMerkleRoot(merkleRoots[i]);
  await tx.wait();
}

// Mint tokens in batches using the Merkle proofs
for (let i: number = 0; i < batches.length; i++) {
  const tokenIds: number[] = batches[i].map(token => token.id);
  const proofs: string[][] = batches[i].map(token => merkleTrees[i].getProof(token));

  // Mint tokens using the batchMintNFTs function
  const tx = await contract.batchMintNFTs(tokenIds, proofs);
  await tx.wait();
}
