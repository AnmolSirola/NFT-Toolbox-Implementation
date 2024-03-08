## **After Initializing the Contract Object**

Pass the required configurations to draftContract function to create a Solidity File.

 - Standard ERC 998

```nftToolbox.draftContract({
    baseUri: "ipfs://exampleCID/",
    // Common options
    burnable: false,
    pausable: false,
    mintable: false,
    // ERC998 options
    composable: true,
    rootOwner: "0x0000000000000000000000000000000000000000", // Address of the root owner
    rootId: 1, // Root ID for the composable tokens
    extension: "0x0000000000000000000000000000000000000000", // Address of the ERC998 extension contract
    extensionId: 1, // Extension ID for the composable tokens
});
```

 - Standard ERC 1151


```nftToolbox.draftContract({
    baseUri: "ipfs://exampleCID/",
    // Common options
    burnable: false,
    pausable: false,
    mintable: false,
    // ERC1151 options
    nftOwners: {}, // Mapping for NFT owners
    ownerToNFTCount: {}, // Mapping for owner NFT count
    nftApprovals: {}, // Mapping for NFT approvals
    nftBalances: {}, // Mapping for NFT balances
    nftData: {}, // Mapping for NFT data
    operatorApprovals: {}, // Mapping for operator approvals
});
