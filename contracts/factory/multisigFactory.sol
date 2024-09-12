// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "../MultiSig.sol";


contract MultiSigFactory{
    MultiSig[] public multisigClones;

    function createMultiSigWallet(uint8 _quorum, address[] memory _signers) external returns(MultiSig _newMultiSig, uint256 _length){
       _newMultiSig = new MultiSig(_quorum, _signers);
       multisigClones.push(_newMultiSig);
       _length=multisigClones.length;
    }

    function getMultiSigClones() external view returns(MultiSig[] memory){
        return multisigClones;
    }

} 