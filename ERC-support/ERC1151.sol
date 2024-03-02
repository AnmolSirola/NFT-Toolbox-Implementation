pragma solidity ^0.8.0;

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
}    