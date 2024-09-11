// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// for ReentrancyGuard
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract MultiSig is ReentrancyGuard  {
address[] public signers;
uint8 public qorum;
uint8 public noValidSigners;

uint8 public trxId;

  struct  Transaction{
    uint8 id;
    address recipient;
    uint256 amount;
    address sender;
    address tokenAddress;
    uint256 transactionTime;
    uint8 numberOfApproval;
    bool isCompleted;
    address[] _signee;
  }
  struct QorumUpdate{
   uint8 proposedQorum;
   uint8 numberOfApproval;
   bool isCompleted;
   address[] _signee;
  }
   mapping(uint8=>QorumUpdate) public qorumUpdate;
   mapping (address=>bool) isValidSigners;
   mapping(address=>mapping(uint256=> bool)) hasSigned;
   mapping(address=>mapping(uint256=>bool)) hasSignedQorum;
   mapping(uint8=>Transaction) public transactions;
   uint8 public qorumId;


  constructor(uint8 _qorum, address[] memory _signers){

      signers = _signers;
    for(uint8 i=0; i<_signers.length; i++){

        address validSigner = _signers[i];
        if(validSigner==address(0)){
           revert  ZeroAddressDetected();
         }
       require(!isValidSigners[validSigner], "Signer already exist");
        

        isValidSigners[_signers[i]]= true;
    }
         noValidSigners =uint8(_signers.length);

        if(!isValidSigners[msg.sender]){
        isValidSigners[msg.sender] = true;
        noValidSigners += 1;
        }
        if(_qorum<=0 || _qorum>noValidSigners){
        revert NotAValidQorum();
    }
    qorum =_qorum;
  }
   
   
   error ZeroAddressDetected();
   error InvalidTransaction();
   error TransactionCompleted();
   error InsufficientBalance();
   error CannotSignTransactionTwice();
   error NotAValidSigner();
   error NotAValidQorum();

function transfer(address _recipient, uint256 _amount, address _tokenAddress) external {
    if(_recipient==address(0)){
   revert ZeroAddressDetected();
    }
    if(!isValidSigners[msg.sender]){
        revert NotAValidSigner();
    }
    if(_amount<=0 || _amount>IERC20(_tokenAddress).balanceOf(address(this))){
       revert InsufficientBalance();
    }
    uint8 _trxid = trxId +1;
    Transaction storage _transaction = transactions[_trxid];
    _transaction.amount=_amount;
    _transaction.tokenAddress =_tokenAddress;
    _transaction.sender = msg.sender;
    _transaction.recipient=_recipient;
    _transaction.id = _trxid;
    _transaction.transactionTime = block.timestamp;
    _transaction.numberOfApproval +=1;
    _transaction._signee.push(msg.sender);
    hasSigned[msg.sender][_trxid] =true;

    trxId +=1;

}

function approveTransaction(uint8 _trxId) external nonReentrant{
    if(_trxId==0){
        revert InvalidTransaction();
    }

    Transaction storage _transaction = transactions[_trxId];
    require(IERC20(_transaction.tokenAddress).balanceOf(address(this))>=_transaction.amount, "Insufficient Funds");
    if(_transaction.isCompleted){
        revert TransactionCompleted();
    }
    if(hasSigned[msg.sender][_trxId]){
       revert CannotSignTransactionTwice(); 
    }
    _transaction.numberOfApproval +=1;
    _transaction._signee.push(msg.sender);
    if(_transaction.numberOfApproval==qorum){
        _transaction.isCompleted =true;
      IERC20(_transaction.tokenAddress).transfer(_transaction.recipient, _transaction.amount);
    }
}



function withdraw(uint256 _amount, address _tokenAddress) external  {
    if(msg.sender==address(0)){
        revert ZeroAddressDetected();
    }
    if (_amount == 0 || _amount > IERC20(_tokenAddress).balanceOf(address(this))) {
                revert InsufficientBalance();
            }
    uint8 _trxid = trxId +1;
    Transaction storage _transaction = transactions[_trxid];
    _transaction.amount=_amount;
    _transaction.tokenAddress =_tokenAddress;
    _transaction.sender = address(this);
    _transaction.recipient = msg.sender;
    _transaction.transactionTime = block.timestamp;
    _transaction.numberOfApproval +=1;
    _transaction._signee.push(msg.sender);
    hasSigned[msg.sender][_trxid] =true;

    trxId +=1;
}

function updateQorum(uint8 newQorum) external {
    if(!isValidSigners[msg.sender]){
    revert NotAValidSigner();
    }
    if(newQorum<=0 || newQorum>noValidSigners){
        revert NotAValidQorum();
    }
    uint8 qId = qorumId+1;
    QorumUpdate storage _qorumUpdate = qorumUpdate[qId];

    _qorumUpdate.proposedQorum = newQorum;
    _qorumUpdate.numberOfApproval +=1;
    _qorumUpdate._signee.push(msg.sender);

    hasSignedQorum[msg.sender][qId]= true;


    qorumId+=1;
    }

function approveQorumUpdate(uint8 _qorumId) external {
        if (_qorumId == 0) {
                revert InvalidTransaction();
                }
        if(!isValidSigners[msg.sender]){
        revert NotAValidSigner();
        }

        QorumUpdate storage _qorumUpdate = qorumUpdate[_qorumId];
            if (_qorumUpdate.isCompleted) {
                revert TransactionCompleted();
                }
        if(hasSignedQorum[msg.sender][_qorumId]){
            revert CannotSignTransactionTwice();
        }
        _qorumUpdate.numberOfApproval+=1;
        _qorumUpdate._signee.push(msg.sender);
        hasSignedQorum[msg.sender][_qorumId]= true;
        if(_qorumUpdate.numberOfApproval>=qorum){
            _qorumUpdate.isCompleted=true;
            qorum=_qorumUpdate.proposedQorum;
        }
        }

}
