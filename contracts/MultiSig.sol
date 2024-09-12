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
enum TrxType{TokenTrx, QuorumTRx,UpdateSignerTrx }

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
    uint8 proposedQuorom;
    address newSigner;
    TrxType trxType;
  }
   mapping (address=>bool) public isValidSigners;
   mapping(address=>mapping(uint256=> bool)) hasSigned;
   mapping(address=>mapping(uint256=>bool)) hasSignedQorum;
   mapping(uint8=>Transaction) public transactions;


  constructor(uint8 _qorum, address[] memory _signers){
    require(_qorum>1, "Quorum must be greater than 1");

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
    trxId=1;
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
    // uint8 _trxid = trxId +1;
    Transaction storage _transaction = transactions[trxId];
    _transaction.trxType = TrxType.TokenTrx;
    _transaction.amount=_amount;
    _transaction.tokenAddress =_tokenAddress;
    _transaction.sender = msg.sender;
    _transaction.recipient=_recipient;
    _transaction.id = trxId;
    _transaction.transactionTime = block.timestamp;
    _transaction.numberOfApproval +=1;
    _transaction._signee.push(msg.sender);
    hasSigned[msg.sender][trxId] =true;

    trxId +=1;




}

function approveTransaction(uint8 _trxId) external nonReentrant{
    if(_trxId==0){
        revert InvalidTransaction();
    }

    Transaction storage _transaction = transactions[_trxId];
    if(_transaction.isCompleted){
        revert TransactionCompleted();
    }
    if(hasSigned[msg.sender][_trxId]){
       revert CannotSignTransactionTwice(); 
    }
    _transaction.numberOfApproval +=1;
    if(_transaction.numberOfApproval>=qorum){
        if(_transaction.trxType==TrxType.TokenTrx){ 
      require(IERC20(_transaction.tokenAddress).balanceOf(address(this))>=_transaction.amount, "Insufficient Funds");

      IERC20(_transaction.tokenAddress).transfer(_transaction.recipient, _transaction.amount);
        }else if(_transaction.trxType==TrxType.QuorumTRx){
            qorum =_transaction.proposedQuorom;
        }else if(_transaction.trxType==TrxType.UpdateSignerTrx){
             noValidSigners+=1;
        }
       _transaction.isCompleted =true;
      
    }
}



function withdraw(uint256 _amount, address _tokenAddress) external  {
    if(msg.sender==address(0)){
        revert ZeroAddressDetected();
    }
        if(!isValidSigners[msg.sender]){
        revert NotAValidSigner();
    }
    if (_amount == 0 || _amount > IERC20(_tokenAddress).balanceOf(address(this))) {
                revert InsufficientBalance();
            }
    // uint8 _trxid = trxId +1;
    Transaction storage _transaction = transactions[trxId];
    _transaction.trxType = TrxType.TokenTrx;
    _transaction.amount=_amount;
    _transaction.tokenAddress =_tokenAddress;
    _transaction.sender = address(this);
    _transaction.recipient = msg.sender;
    _transaction.transactionTime = block.timestamp;
    _transaction.numberOfApproval +=1;
    _transaction._signee.push(msg.sender);
    hasSigned[msg.sender][trxId] =true;

    trxId +=1;
}

function updateQorum(uint8 newQorum) external {
    if(!isValidSigners[msg.sender]){
    revert NotAValidSigner();
    }
    
    if(newQorum<=1 || newQorum>noValidSigners){
        revert NotAValidQorum();
    }
    uint8 qId = trxId+1;
    Transaction storage _qorumUpdate = transactions[qId];
    _qorumUpdate.trxType = TrxType.QuorumTRx;   
    _qorumUpdate.proposedQuorom = newQorum;
    _qorumUpdate.numberOfApproval +=1;
    _qorumUpdate._signee.push(msg.sender);
    hasSignedQorum[msg.sender][qId]= true;


    trxId+=1;
    }


    function addSigners(address _newSigner) external{
        isValidSigners[_newSigner]=true;
          if(!isValidSigners[msg.sender]){
            revert NotAValidSigner();
    }
     uint8 qId = trxId+1;
    Transaction storage _signerUpdate = transactions[qId];
    _signerUpdate.trxType = TrxType.UpdateSignerTrx;   
    _signerUpdate.newSigner = _newSigner;
    _signerUpdate.numberOfApproval +=1;
    _signerUpdate._signee.push(msg.sender);
    hasSignedQorum[msg.sender][qId]= true;
    trxId+=1;
    }   


}
