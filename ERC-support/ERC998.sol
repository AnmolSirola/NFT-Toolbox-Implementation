// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface ERC998TopDownEnumerable {
    function totalChildTokens(uint256 _tokenId) external view returns (uint256);
    function childTokenByIndex(uint256 _tokenId, uint256 _index) external view returns (uint256);
}

contract ERC998TopDown is ERC998TopDownEnumerable {
    mapping(uint256 => uint256[]) internal childTokens;

    function totalChildTokens(uint256 _tokenId) external view override returns (uint256) {
        return childTokens[_tokenId].length;
    }

    function childTokenByIndex(uint256 _tokenId, uint256 _index) external view override returns (uint256) {
        require(_index < childTokens[_tokenId].length, "Index out of bounds");
        return childTokens[_tokenId][_index];
    }

    function _addChildToken(uint256 _tokenId, uint256 _childTokenId) internal {
        childTokens[_tokenId].push(_childTokenId);
    }
}

contract ERC998TopDownToken is ERC998TopDown, IERC721Receiver {
    // ERC721 Token
    IERC721 internal nftContract;

    // Mapping from token ID to owner address
    mapping(uint256 => address) internal tokenOwners;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) internal ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) internal ownedTokensIndex;

    // Event emitted when a child token is added to a parent token
    event ChildAdded(uint256 indexed parentTokenId, uint256 indexed childTokenId);

    constructor(address _nftContract) {
        nftContract = IERC721(_nftContract);
    }

    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        _addChildToken(tokenId, tokenId);
        _transferOwnership(tokenId, from, address(this));
        return IERC721Receiver.onERC721Received.selector;
    }

    function _transferOwnership(
        uint256 tokenId,
        address from,
        address to
    ) internal {
        tokenOwners[tokenId] = to;

        if (from != address(0)) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        _addTokenToOwnerEnumeration(to, tokenId);
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) internal {
        uint256 length = ownedTokens[to].length;
        ownedTokens[to].push(tokenId);
        ownedTokensIndex[tokenId] = length;
    }

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

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = tokenOwners[tokenId];
        return (spender == owner || nftContract.getApproved(tokenId) == spender || nftContract.isApprovedForAll(owner, spender));
    }
}
