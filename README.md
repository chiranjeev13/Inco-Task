# 🔐 Private Wealth Comparison (Millionaire's Dilemma)

```
+-------------------+     +------------------+     +------------------+
|   Millionaire A   |     |   Millionaire B  |     |   Millionaire C  |
|    $encrypted     | --> |    $encrypted    | --> |    $encrypted    |
+-------------------+     +------------------+     +------------------+
           |                      |                       |
           v                      v                       v
      +--------------------------------------------------------+
      |              Privacy-Preserving Smart Contract         |
      |          "Who's the richest? Nobody knows except       |
      |           the winners, and only that they won!"        |
      +--------------------------------------------------------+
```

## 🎯 The Classic Millionaire's Problem

> "Two millionaires wish to know who is richer without revealing their actual wealth."
> - Andrew C. Yao, 1982


### 🌟 Our Modern Solution
This project implements a privacy-preserving wealth comparison system where:
- 🔒 Participants submit **encrypted** wealth values
- 🤝 **Multiple** participants can join (not just three!)
- 🔐 No actual wealth values are ever exposed
- 🔄 The contract finds the richest participant(s), can handle **multiple winners**

## Technical Details: PrivateWealth Contract

### 🎭 Privacy Features
- Uses Inco Lightning's homomorphic encryption
- Supports encrypted comparisons without revealing values
- Ensures wealth values remain private even from the contract owner
- Handles multiple winners elegantly

### 🔄 How It Works
1. **Submission Phase**
   ```
   User -> [Encrypt Wealth] -> Contract
   ```
2. **Comparison Phase**
   ```
   Contract -> [Compare Encrypted Values] -> Find Maximum
   ```
3. **Winner Revelation**
   ```
   CoValidator -> [Verify & Reveal Winners] -> Public
   ```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/) or npm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for Solidity development and testing)

## 🔍 Quick Reference

### 📋 Contract Functions
```
submitWealth()  →  richest()  →  getWinners()
       ↓              ↓              ↓
   [Encrypt]     [Compare]     [View Results]
```

### 🎯 Test Coverage Map
```
+----------------------+     +----------------------+
|    Core Logic        |     |    Access Control    |
|  ================    |     |  ================    |
| ■ Submission         |     | ■ User Access        |
| ■ Comparison         |     | ■ Owner Rights       |  
| ■ Winner Selection   |     | ■ CoValidator        |
| ■ State Reset        |     | ■ Privacy Checks     |
+----------------------+     +----------------------+
```

## 🎮 Quick Commands

```
🔨 Build      →  forge build : Compiles the contracts
🧪 Test       →  forge test : Runs the tests
```

## 🔐 Privacy Layers

```
Level 1: 🔒 Encrypted Input
         └─→ User submits encrypted wealth

Level 2: 🛡️ Access Control
         └─→ Only owner can manage contract
             └─→ Only users can view their own wealth

Level 3: 🎭 Comparison Privacy
         └─→ Homomorphic operations
             └─→ Only winners revealed

Level 4: 🗝️ CoValidator
         └─→ Decryption request handling
             └─→ Result verification
```
---

## 1. Contracts (Foundry)

### Location

All smart contracts are located in the `contracts/` directory. The main contract is `PrivateWealth.sol`.

### Installing Dependencies

Install all dependencies (including those for Foundry and Solidity libraries):

```bash
yarn install
# or
npm install
```

### Compiling Contracts

Use Foundry to compile the contracts:

```bash
forge build
```

This will output compiled artifacts to the `artifacts/` directory.

---

### Architecture & Key Functions

- **Encrypted Wealth Submission:**
  - `submitWealth(bytes eAmount)`: Allows a participant to submit their encrypted wealth. Each address can only submit once per round.
  - Uses `euint256` (encrypted uint256) from Inco Lightning for privacy.
- **Finding the Richest:**
  - `richest()`: Compares all submitted encrypted wealths using privacy-preserving greater-than and equality checks. Triggers decryption requests for the maximum value(s) via the coValidator.
  - `resultCallback(uint256, bool, bytes)`: Called by the coValidator to confirm which participants are the richest. Only the coValidator can call this.
- **State Management:**
  - `resetArrays()`: Resets all state (participants, winners, wealths) for a new round.
  - `getWinners()`: Returns the addresses of the richest participants.
  - `getParticipants()`: Returns all participants in the current round.
- **Access Control:**
  - `getWealthbyUser()`: Allows only the participant to view their own submitted wealth (enforced by `isAllowed`).
  - `updateCoValidator(address)`: Only the contract owner can update the coValidator address.

---

## Note on Transient Allowance and Single-Call Richest Calculation

In the current implementation, participants must first submit their encrypted wealth, and then a separate call to `richest()` is required to calculate and trigger decryption for the richest participant(s). This two-step process is necessary because the contract must finalize all state (i.e., all value.allowThis() should be finalized) before it can access and compare the encrypted values.

If the Inco Lightning SDK supported `e.transientAllow()`, this could be streamlined into a single call. A transient allowance is an allowance that is valid only for the current transaction. With `e.TransientAllow()`, the results of operations (such as `e.add`, `e.gt`, etc.) are transiently allowed to be decrypted by the contract that performed the operation, but only within the same transaction. This would allow the contract to perform all necessary encrypted operations and trigger decryption in a single call, without requiring state to be finalized first.

**Why this matters:**

- **Current approach:** Requires two calls: one to submit, one to calculate and request decryption.
- **With transient allowance:** Could enable a single call for both submission and richest calculation, improving UX and reducing complexity.
- **Status:** `e.TransientAllow()` is not yet available in the SDK, so the current two-step process is required.

---

## 2. Tests (Foundry)

### Location

All tests are in `test/foundry/`, e.g., `PrivateWealth.t.sol`.

### Running Tests

Run all tests using Foundry:

```bash
forge test
```

### Test Philosophy & Coverage

- **Framework:** Tests are written in Solidity using Foundry and the Inco Lightning test base (`IncoTest`).
- **Helper Functions:** `_submitWealth(address, uint256)` simulates encrypted wealth submission for any participant.
- **Tested Scenarios:**
  - **Correctness:**
    - All participants submit equal wealth (all are winners).
    - Different wealths (only the richest is the winner).
    - Multiple participants with the same highest wealth (multiple winners).
    - Zero wealth edge case.
  - **Access Control:**
    - Only the participant can view their own wealth.
    - Owner, contract, or other users cannot view another's wealth.
    - CoValidator can only call `resultCallback`.
  - **State Management:**
    - Double submission is prevented.
    - State is properly reset between rounds.
    - Winners and participants are tracked and cleared correctly.
  - **Decryption & Privacy:**
    - Decryption requests are handled securely and only by the coValidator.
    - Unauthorized decryption or callback attempts are reverted.
  - **Edge Cases:**
    - Submitting after reset.
    - Accessing wealth after reset.
    - Handling of unauthorized access attempts.

### Example Test Cases

- `test_AllEqualWealth`: All participants submit the same wealth; all are winners.
- `test_DifferentWealth`: Only the participant with the highest wealth is the winner.
- `test_TwoEqualHighest`: Two participants share the highest wealth; both are winners.
- `test_DoubleSubmission`: Prevents a participant from submitting twice.
- `test_ZeroWealth`: Handles zero as a valid wealth value.
- `test_GetWealthByUser`: Only the participant can view their own wealth.

### Access Control Test Cases

#### Basic Access Control Tests

1. **Unauthorized Access Prevention**
```solidity
function test_GetWealthByUserNotAllowed() public {
    vm.prank(bob);  // Try to access as bob
    vm.expectRevert("Not Allowed to fetch");
    pvtW.getWealthbyUser();  // Should fail as bob hasn't submitted wealth
}
```
**Intuition**: Users who haven't submitted wealth shouldn't be able to access any wealth values. This prevents unauthorized access attempts.

2. **Post-Reset Access Prevention**
```solidity
function test_GetWealthByUserAfterReset() public {
    uint256 initialWealth = 200;
    _submitWealth(alice, initialWealth);  // Alice submits wealth
    
    pvtW.resetArrays();  // Reset the contract state
    
    vm.prank(alice);
    vm.expectRevert("Not Allowed to fetch");  // Even Alice can't access after reset
    pvtW.getWealthbyUser();
}
```
**Intuition**: After a reset, all previous permissions should be revoked. This ensures clean state transitions between rounds and prevents data leakage.

#### Contract and Owner Access Control

3. **Contract Self-Access Prevention**
```solidity
function test_AccessControl_ContractCannotAccessUserWealth() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(address(pvtW));  // Try to access as the contract itself
    vm.expectRevert("Not Allowed to fetch");
    pvtW.getWealthbyUser();
}
```
**Intuition**: Even the contract itself shouldn't be able to decrypt user wealth directly. This enforces that all decryption must go through proper channels (coValidator).

4. **Owner Access Restriction**
```solidity
function test_AccessControl_OwnerCannotAccessUserWealth() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(owner);  // Try to access as contract owner
    vm.expectRevert("Not Allowed to fetch");
    pvtW.getWealthbyUser();
}
```
**Intuition**: Contract ownership shouldn't grant access to private data. This separates administrative privileges from data access.

#### User Data Access Control

5. **User Self-Access**
```solidity
function test_AccessControl_UserCanAccessOwnWealth() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(alice);
    euint256 result = pvtW.getWealthbyUser();
    processAllOperations();
    uint256 decryptedWealth = getUint256Value(result);

    assertEq(decryptedWealth, aliceWealth, 
        "User should be able to access their own wealth");
}
```
**Intuition**: Users should always be able to decrypt their own submitted wealth. This is a fundamental privacy right.

6. **Cross-User Access Prevention**
```solidity
function test_AccessControl_UserCannotAccessOtherUserWealth() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(bob);  // Try to access as another user
    vm.expectRevert("Not Allowed to fetch");
    pvtW.getWealthbyUser();
}
```
**Intuition**: Users should never be able to access each other's wealth values, maintaining individual privacy.

#### CoValidator and Decryption Control

7. **Decryption Request Handling**
```solidity
function test_AccessControl_DecryptionRequestHandling() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(alice);
    euint256 result = pvtW.getWealthbyUser();

    vm.prank(address(pvtW));
    result.requestDecryption(
        this.resultCallback.selector,
        abi.encode(alice)
    ); // this results in EVM revert( can check in logs ) but in sub calls so foundry cant catch it in actual blockchain this request will revert
    processAllOperations();
    uint256 decryptedWealth = getUint256Value(result);

    assertEq(decryptedWealth, aliceWealth, 
        "Decrypted wealth should match submitted amount");
}
```
**Intuition**: Decryption requests should only be processed in the correct context and with proper authorization.

8. **CoValidator Access Control**
```solidity
function test_AccessControl_CoValidatorCanAccessUserWealth() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(pvtW.coValidator());
    vm.expectRevert("Not Allowed to fetch");
    pvtW.getWealthbyUser();  // Even coValidator can't directly access
}
```
**Intuition**: The coValidator should only have specific, limited capabilities (like handling decryption requests) but not direct data access.

9. **CoValidator Callback Control**
```solidity
function test_AccessControl_resultCallback_coValidator() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(pvtW.coValidator());
    pvtW.resultCallback(0, true, abi.encode(alice));
    // Should succeed as coValidator
}

function test_AccessControl_resultCallback_Not_coValidator() public {
    uint256 aliceWealth = 200;
    _submitWealth(alice, aliceWealth);

    vm.prank(alice);  // Try as non-coValidator
    vm.expectRevert("Only co-validator can call");
    pvtW.resultCallback(0, true, abi.encode(alice));
}
```
**Intuition**: Only the coValidator should be able to confirm results through the callback mechanism. This ensures the integrity of the wealth comparison process so that no one can cheat the by calling the callback function themselves.

#### Key Testing Principles
1. **Isolation**: Each test focuses on one specific access control aspect
2. **Complete Coverage**: Tests cover all roles (user, owner, contract, coValidator)
3. **State Transitions**: Tests verify access control across different contract states
4. **Edge Cases**: Tests include reset scenarios and unauthorized access attempts
5. **Privacy Preservation**: Tests ensure encrypted values remain private except to authorized parties

These tests form a comprehensive security layer, ensuring that the privacy-preserving aspects of the contract work as intended across all possible scenarios and user roles.

---

## 3. Frontend (Minimal)

The frontend is a Next.js app in `minimal-frontend/`.

### To Run the Frontend

```bash
cd minimal-frontend
yarn install
# or
npm install
yarn dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Project Structure

```
contracts/           # Solidity smart contracts
script/              # (Optional) Deployment scripts
artifacts/           # Compiled contract artifacts
minimal-frontend/    # Next.js frontend
  src/               # Frontend source code
test/foundry/        # Foundry test files
```

---

## 5. Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Inco Lightning](https://github.com/inco-io/lightning)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

## 6. Contact

For questions or contributions, please open an issue or pull request.

### How to Deploy

#### Deployment Parameters
The `PrivateWealth` contract requires one critical parameter during deployment:

- `coValidator` (address): A INCO coValidator contract address responsible for handling decryption requests(i.e call `resultCallback`) and confirming winners.

#### Deployment Script Breakdown
```solidity
contract DeployPrivateWealth is Script {
    function run() public returns (PrivateWealth) {
        // Create a fork of the Sepolia Base network
        vm.createSelectFork("https://sepolia.base.org");
        
        // Start broadcasting transactions
        vm.startBroadcast();
        
        // Predefined coValidator address
        address coValidator = 0x63D8135aF4D393B1dB43B649010c8D3EE19FC9fd;
        
        // Deploy the contract
        PrivateWealth privateWealth = new PrivateWealth(coValidator);
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        return privateWealth;
    }
}
```

#### Deployment Methods

1. **Using Foundry**
```bash
# Local deployment
forge script script/Deploy.s.sol

# Deployment with broadcasting (actually deploying to the network)
forge script script/Deploy.s.sol --rpc-url <your_rpc_url> --private-key <your_private_key> --broadcast
```

2. **Deployment Considerations**
- Ensure you have a valid `coValidator` address
- The deployer needs sufficient network tokens for gas
- Choose a network compatible with Inco Lightning's privacy features
- Verify the network supports the required Solidity version (^0.8.28)

#### Selecting a CoValidator
The `coValidator` is a critical component:
- Must be a trusted, secure address
- Responsible for decryption request handling
- Confirms the winners in the privacy-preserving comparison
- In the example script, a predefined address is used

#### Network Support
- Tested on Sepolia Base network 
---
