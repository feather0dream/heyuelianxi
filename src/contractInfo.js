// src/contractInfo.js

// CHANGED: The import is now at the top to fix the ESLint error.
import contractABIJson from './abis/TaskRewardPlatform.json';

// 1. 替换成你自己的合约地址！
export const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // 确保这是你部署后得到的地址

// 2. 导出合约的ABI
// CHANGED: The path now points inside the src folder, which is allowed.
export const contractABI = contractABIJson.abi;
