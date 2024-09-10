## MultiSig Smart Contract
This is a simple Solidity-based Multi-Signature Wallet (MultiSig) smart contract. It allows a set of predefined signers to approve and execute token transfers only when a quorum is met. Additionally, the contract allows for updating the quorum, with signer approvals required for the change to take effect.

## Features
Transaction Creation: Any valid signer can propose a transfer of tokens.
Transaction Approval: Transactions require approval from a number of signers equal to the quorum to be executed.
Quorum Update: The contract allows updating the quorum, with a similar approval mechanism as transactions.
Withdrawals: Signers can initiate and approve withdrawals from the contract balance.

## Requirements
Solidity ^0.8.0
Hardhat development environment
OpenZeppelin's ERC20 library for token handling


## Error Handling
ZeroAddressDetected: Thrown when attempting to use a zero address.
InvalidTransaction: Thrown when trying to approve or execute an invalid transaction.
TransactionCompleted: Thrown when trying to approve an already completed transaction.
InsufficientBalance: Thrown when attempting to withdraw or transfer more than the contract balance.
CannotSignTransactionTwice: Thrown when a signer attempts to approve the same transaction multiple times.
NotAValidSigner: Thrown when a non-signer attempts to interact with the contract.
NotAValidQorum: Thrown when an invalid quorum is proposed or set.

```
