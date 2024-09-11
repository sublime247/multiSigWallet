// Sources flattened with hardhat v2.22.10 https://hardhat.org

// SPDX-License-Identifier: MIT AND UNLICENSED

// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v5.0.2

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.20;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}


// File contracts/MultiSig.sol

// Original license: SPDX_License_Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract MultiSig {
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

function approveTransaction(uint8 _trxId) external{
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



function withdraw(uint256 _amount, address _tokenAddress) external {
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
