// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
interface  IMultiSig {
    function transfer(address _recipient, uint256 _amount, address _tokenAddress) external;
    function approveTransaction(uint8 _trxId) external;
    function withdraw(uint256 _amount, address _tokenAddress) external;
    function updateQorum(uint8 newQorum) external;
      // Removed the state variable declaration as interfaces cannot contain state variables
    function approveQorumUpdate(uint8 _qorumId) external;
}