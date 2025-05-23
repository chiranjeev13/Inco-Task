# Inco-Task Monorepo

This project contains:
- **Smart Contracts** (in `contracts/`)
- **Tests** (in `test/`)
- **Frontend** (in `minimal-frontend/`)

## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://yarnpkg.com/) or npm
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for Solidity development and testing)

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

## Technical Details: PrivateWealth Contract

### Purpose
`PrivateWealth` is a privacy-preserving smart contract for securely submitting, comparing, and revealing the wealth of participants. It leverages the Inco Lightning library for encrypted data types and privacy-preserving operations.

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

### Privacy & Security
- All wealth values are encrypted using Inco Lightning's `euint256`.
- Only the participant can view their own wealth; others (including the owner and coValidator) cannot.
- The coValidator is a special address responsible for handling decryption requests and confirming winners.
- Double submission is prevented; each participant can only submit once per round.
- All state can be reset for new rounds, ensuring no data leakage between rounds.

### Extending the Contract
- Add new encrypted operations or privacy-preserving logic using Inco Lightning's types and functions.
- Add new access control rules by extending the `Ownable` or custom modifiers.
- Add new events for better off-chain tracking.

---

## Note on Transient Allowance and Single-Call Richest Calculation

In the current implementation, participants must first submit their encrypted wealth, and then a separate call to `richest()` is required to calculate and trigger decryption for the richest participant(s). This two-step process is necessary because the contract must finalize all state (i.e., all submissions) before it can access and compare the encrypted values.

If the Inco Lightning SDK supported `e.TransientAllow()`, this could be streamlined into a single call. A transient allowance is an allowance that is valid only for the current transaction. With `e.TransientAllow()`, the results of operations (such as `e.add`, `e.gt`, etc.) are transiently allowed to be decrypted by the contract that performed the operation, but only within the same transaction. This would allow the contract to perform all necessary encrypted operations and trigger decryption in a single call, without requiring state to be finalized first.

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
- `test_Reset`: Ensures state is cleared and new rounds work as expected.
- `test_GetWealthByUser`: Only the participant can view their own wealth.

### Access Control Test Cases
- `test_GetWealthByUserNotAllowed`: Ensures a user cannot view another user's wealth.
- `test_GetWealthByUserAfterReset`: Ensures a user cannot view their wealth after the state has been reset.
- `test_AccessControl_ContractCannotAccessUserWealth`: Ensures the contract itself cannot decrypt a user's wealth.
- `test_AccessControl_UserCanAccessOwnWealth`: Confirms that a user can decrypt their own wealth.
- `test_AccessControl_UserCannotAccessOtherUserWealth`: Ensures a user cannot access another user's wealth.
- `test_AccessControl_OwnerCannotAccessUserWealth`: Ensures the contract owner cannot access a user's wealth.
- `test_AccessControl_DecryptionRequestHandling`: Verifies that decryption requests are handled securely and only by the contract in the correct context.
- `test_AccessControl_CoValidatorCanAccessUserWealth`: Ensures the coValidator cannot directly access a user's wealth via `getWealthbyUser`.
- `test_AccessControl_resultCallback_coValidator`: Ensures only the coValidator can call `resultCallback` to confirm winners.
- `test_AccessControl_resultCallback_Not_coValidator`: Ensures that any address other than the coValidator cannot call `resultCallback` (should revert).

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
