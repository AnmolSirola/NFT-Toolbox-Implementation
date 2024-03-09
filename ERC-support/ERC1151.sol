// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Interface for contracts that can receive ERC1151 tokens
interface ERC1151Receiver {
    function onERC1151Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data) external returns (bytes4);
}

// ERC1151 contract
contract ERC1151 {
    // Internal storage for Non-Fungible Token (NFT) data
    mapping(uint256 => address) internal nfOwners;
    mapping(address => uint256) internal ownerToNFCount;
    mapping(uint256 => address) internal nfApprovals;
    mapping(uint256 => uint256) internal nfBalances;
    mapping(uint256 => string) internal nfData;

    // Internal function to mint new NFTs
    function _mint(address _to, uint256 _id, uint256 _value, string memory _data) internal {
        require(_to != address(0), "ERC1151: cannot mint to zero address");
        nfBalances[_id] += _value;
        nfOwners[_id] = _to;
        ownerToNFCount[_to]++;
        nfData[_id] = _data;
        emit TransferSingle(msg.sender, address(0), _to, _id, _value);
    }

    // Internal function to safely transfer NFTs between addresses
    function _safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data) internal {
        // Check if the recipient is a contract and handle the transfer accordingly
        if (_to.isContract()) {
            bytes4 retval = ERC1151Receiver(_to).onERC1151Received(msg.sender, _from, _id, _value, _data);
            require(retval == ERC1151Receiver(_to).onERC1151Received.selector, "ERC1151: invalid return value from receiver");
        }
        nfBalances[_id] -= _value;
        nfOwners[_id] = _to;
        ownerToNFCount[_from]--;
        ownerToNFCount[_to]++;
        emit TransferSingle(msg.sender, _from, _to, _id, _value);
    }

    // Internal function to transfer NFTs between addresses
    function _transferFrom(address _from, address _to, uint256 _id, uint256 _value) internal {
        require(nfOwners[_id] == _from, "ERC1151: not owner of NFT");
        require(nfApprovals[_id] == msg.sender, "ERC1151: not approved to transfer NFT");
        nfBalances[_id] -= _value;
        nfOwners[_id] = _to;
        ownerToNFCount[_from]--;
        ownerToNFCount[_to]++;
        emit TransferSingle(msg.sender, _from, _to, _id, _value);
    }

    // Public function to safely transfer NFTs between addresses
    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data) public {
        require(_to != address(0), "ERC1151: cannot transfer to zero address");
        require(nfOwners[_id] == _from, "ERC1151: not owner of NFT");
        require(nfApprovals[_id] == msg.sender, "ERC1151: not approved to transfer NFT");
        _safeTransferFrom(_from, _to, _id, _value, _data);
    }

    // Public function to transfer NFTs between addresses
    function transferFrom(address _from, address _to, uint256 _id, uint256 _value) public {
        require(_to != address(0), "ERC1151: cannot transfer to zero address");
        require(nfOwners[_id] == _from, "ERC1151: not owner of NFT");
        require(nfApprovals[_id] == msg.sender, "ERC1151: not approved to transfer NFT");
        _transferFrom(_from, _to, _id, _value);
    }

    // Public function to get the balance of a specific NFT for a given owner
    function balanceOf(address _owner, uint256 _id) public view returns (uint256) {
        if (nfOwners[_id] == _owner) {
            return nfBalances[_id];
        } else {
            return 0;
        }
    }

    // Public function to get the owner of a specific NFT
    function ownerOf(uint256 _id) public view returns (address) {
        return nfOwners[_id];
    }

    // Public function to approve the transfer of a specific NFT to another address
    function approve(address _to, uint256 _id) public {
        require(nfOwners[_id] == msg.sender, "ERC1151: not owner of NFT");
        nfApprovals[_id] = _to;
        emit Approval(msg.sender, _to, _id);
    }

    // Public function to set or revoke approval for all NFTs on behalf of the owner
    function setApprovalForAll(address _operator, bool _approved) public {
        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    // Public function to check if an operator is approved for all NFTs on behalf of the owner
    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return operatorApprovals[_owner][_operator];
    }

    // Public function to transfer a specific amount of NFTs to another address
    function transfer(address _to, uint256 _id, uint256 _value) public {
        require(_to != address(0), "ERC1151: cannot transfer to zero address");
        require(nfOwners[_id] == msg.sender, "ERC1151: not owner of NFT");
        nfBalances[_id] -= _value;
        nfOwners[_id] = _to;
        ownerToNFCount[msg.sender]--;
        ownerToNFCount[_to]++;
        emit TransferSingle(msg.sender, msg.sender, _to, _id, _value);
    }

    // Events to log important contract actions
    event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _id);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
}
