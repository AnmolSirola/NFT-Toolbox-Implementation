// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Importing necessary contracts from OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

// Interface for ERC998 Top-Down Enumerable
interface ERC998TopDownEnumerable {
    function totalChildTokens(uint256 _tokenId) external view returns (uint256);
    function childTokenByIndex(uint256 _tokenId, uint256 _index) external view returns (uint256);
}

// ERC998 Top-Down contract implementing the enumerable interface
contract ERC998TopDown is ERC998TopDownEnumerable {
    // Mapping to keep track of child tokens for each parent token
    mapping(uint256 => uint256[]) internal childTokens;

    // Function to get the total number of child tokens for a given parent token
    function totalChildTokens(uint256 _tokenId) external view override returns (uint256) {
        return childTokens[_tokenId].length;
    }

    // Function to get the child token at a specific index for a given parent token
    function childTokenByIndex(uint256 _tokenId, uint256 _index) external view override returns (uint256) {
        require(_index < childTokens[_tokenId].length, "Index out of bounds");
        return childTokens[_tokenId][_index];
    }

    // Internal function to add a child token to a parent token
    function _addChildToken(uint256 _tokenId, uint256 _childTokenId) internal {
        childTokens[_tokenId].push(_childTokenId);
    }
}

// ERC998 Top-Down Token contract implementing ERC998TopDown and ERC721Receiver interfaces
contract ERC998TopDownToken is ERC998TopDown, IERC721Receiver {
    // Reference to the ERC721 token contract
    IERC721 internal nftContract;

    // Mapping to track the owner of each token
    mapping(uint256 => address) internal tokenOwners;

    // Mapping to track the tokens owned by each address
    mapping(address => uint256[]) internal ownedTokens;

    // Mapping to track the index of each token in the owner's list
    mapping(uint256 => uint256) internal ownedTokensIndex;

    // Event emitted when a child token is added to a parent token
    event ChildAdded(uint256 indexed parentTokenId, uint256 indexed childTokenId);

    // Constructor to set the ERC721 token contract
    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    // Function to handle ERC721 token reception
    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        // Add the received token as a child to itself
        _addChildToken(tokenId, tokenId);

        // Transfer ownership of the received token to this contract
        _transferOwnership(tokenId, from, address(this));

        // Indicate successful reception using the ERC721Receiver interface
        return IERC721Receiver.onERC721Received.selector;
    }

    // Internal function to transfer ownership of a token
    function _transferOwnership(
        uint256 tokenId,
        address from,
        address to
    ) internal {
        // Set the new owner for the token
        tokenOwners[tokenId] = to;

        // If transferring from an existing owner, update their list of owned tokens
        if (from != address(0)) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        // Add the token to the new owner's list of owned tokens
        _addTokenToOwnerEnumeration(to, tokenId);
    }

    // Internal function to add a token to the owner's list of owned tokens
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        uint256 length = ownedTokens[to].length;
        ownedTokens[to].push(tokenId);
        ownedTokensIndex[tokenId] = length;
    }

    // Internal function to remove a token from the owner's list of owned tokens
    function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) internal {
        uint256 lastTokenIndex = ownedTokens[from].length - 1;
        uint256 tokenIndex = ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = ownedTokens[from][lastTokenIndex];
            ownedTokens[from][tokenIndex] = lastTokenId;
            ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        ownedTokens[from].pop();
        delete ownedTokensIndex[tokenId];
    }

    // Internal function to check if an address is approved or the owner of a token
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = tokenOwners[tokenId];
        return (spender == owner || nftContract.getApproved(tokenId) == spender || nftContract.isApprovedForAll(owner, spender));
    }
}
