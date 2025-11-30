# CarbonGuard Smart Contract Testing Guide

## Testing Steps

### 1. Access Remix IDE
- Open [Remix IDE](https://remix.ethereum.org)
- Create a new workspace or use the default workspace

### 2. Import Project Files
- Upload the `contract/` folder in the file manager

### 3. Compile Contracts
1. Open the **Solidity Compiler** plugin (compiler icon in left sidebar)
2. Select compiler version: **0.8.18+commit.87f61d96**
3. Click **Compile** button 

### 4. Execute Tests
- Open the test file in Remix
- Run the `test.js` test script

## Test Coverage

### 1. Project Lifecycle Testing
- Create multiple carbon credit projects (reforestation, solar farm types)
- Project verification process and credit allocation mechanisms
- Fee mechanism validation (initialization fee, minting fee, retirement fee)

### 2. Token Operations Testing
- Carbon credit token minting functionality
- Token transfer operations between different users
- Token retirement (permanent burning) process

### 3. Permissions and Access Control Testing
- Auditor role permissions verification
- Project owner operation permissions confirmation
- Regular user permission restrictions checking

### 4. Edge Case Testing
- Over-minting restriction mechanisms
- Insufficient fee handling procedures
- Illegal operation prevention features

### 5. State Query Verification
- Complete project information queries
- Accurate user balance statistics
- Proper fee revenue summarization
