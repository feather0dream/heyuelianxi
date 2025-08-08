// scripts/deploy.js
async function main() {
  // 1. 获取要部署的合约
  const TaskRewardPlatform = await ethers.getContractFactory("TaskRewardPlatform");
  console.log("正在部署 TaskRewardPlatform 合约...");

  // 2. 部署合约
  const taskPlatform = await TaskRewardPlatform.deploy();
  await taskPlatform.waitForDeployment(); // 等待部署完成

  // 3. 打印合约地址（这是最重要的信息！）
  const contractAddress = await taskPlatform.getAddress();
  console.log("TaskRewardPlatform 合约已成功部署到地址:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
