pragma solidity ^0.8.19;

interface ERC1151Receiver {
    function onERC1151Received(address _operator, address _from, uint256 _id, uint256 _value, bytes calldata _data) external returns(bytes4);
}

contract ERC1151 {
    mapping (uint256 => address) internal nfOwners;
    mapping (address => uint256) internal ownerToNFCount;
    mapping (uint256 => address) internal nfApprovals;
    mapping (uint256 => uint256) internal nfBalances;
    mapping (uint256 => string) internal nfData;

    function _mint(address _to, uint256 _id, uint256 _value, string memory _data) internal {
        require(_to != address(0), "ERC1151: cannot mint to zero address");
        nfBalances[_id] += _value;
        nfOwners[_id] = _to;
        ownerToNFCount[_to]++;
        nfData[_id] = _data;
        emit TransferSingle(msg.sender, address(0), _to, _id, _value);
    }

    function _safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data) internal {
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

    function _transferFrom(address _from, address _to, uint256 _id, uint256 _value) internal {
        require(nfOwners[_id] == _from, "ERC1151: not owner of NFT");
        require(nfApprovals[_id] == msg.sender, "ERC1151: not approved to transfer NFT");
        nfBalances[_id] -= _value;
        nfOwners[_id] = _to;
        ownerToNFCount[_from]--;
        ownerToNFCount[_to]++;
        emit TransferSingle(msg.sender, _from, _to, _id, _value);
    }

    function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes memory _data) public {
        require(_to != address(0), "ERC1151: cannot transfer to zero address");
        require(nfOwners[_id] == _from, "ERC1151: not owner of NFT");
        require(nfApprovals[_id] == msg.sender, "ERC1151: not approved to transfer NFT");
        _safeTransferFrom(_from, _to, _id, _value, _data);
    }

    function transferFrom(address _from, address _to, uint256 _id, uint256 _value) public {
        require(_to != address(0), "ERC1151: cannot transfer to zero address");
        require(nfOwners[_id] == _from, "ERC1151: not owner of NFT");
        require(nfApprovals[_id] == msg.sender, "ERC1151: not approved to transfer NFT");
        _transferFrom(_from, _to, _id, _value);
    }

    function balanceOf(address _owner, uint256 _id) public view returns (uint256) {
      if (nfOwners[_id] == _owner) {
          return nfBalances[_id];
      } else {
          return 0;
      }
    }

    function ownerOf(uint256 _id) public view returns (address) {
        return nfOwners[_id];
    }

    function approve(address _to, uint256 _id) public {
        require(nfOwners[_id] == msg.sender, "ERC1151: not owner of NFT");
        nfApprovals[_id] = _to;
        emit Approval(msg.sender, _to, _id);
    }

    function setApprovalForAll(address _operator, bool _approved) public {
        operatorApprovals[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    function isApprovedForAll(address _owner, address _operator) public view returns (bool) {
        return operatorApprovals[_owner][_operator];
    }

    function transfer(address _to, uint256 _id, uint256 _value) public {
        require(_to != address(0), "ERC1151: cannot transfer to zero address");
        require(nfOwners[_id] == msg.sender, "ERC1151: not owner of NFT");
        nfBalances[_id] -= _value;
        nfOwners[_id] = _to;
        ownerToNFCount[msg.sender]--;
        ownerToNFCount[_to]++;
        emit TransferSingle(msg.sender, msg.sender, _to, _id, _value);
    }

    event TransferSingle(address indexed _operator, address indexed _from, address indexed _to, uint256 _id, uint256 _value);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _id);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);
}