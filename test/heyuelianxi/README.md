# 任务奖励平台 (Task Reward Platform)

一个基于以太坊智能合约和React前端的去中心化任务奖励平台学习项目。用户可以创建任务并设置ETH奖励，其他用户完成任务后可获得奖励。

## 项目概述
- **智能合约**: 实现任务创建、认领、完成和奖励分发功能
- **前端界面**: React单页应用，提供任务管理和交互界面
- **技术栈**: Solidity, Hardhat, React, Ethers.js

## 快速开始

### 前置要求
- Node.js v14+ 和 npm
- Hardhat开发环境
- MetaMask或其他以太坊钱包
- 测试网ETH (如Goerli, Sepolia)

### 安装步骤

#### 1. 克隆仓库
```bash
git clone <your-github-repo-url>
cd client
```

#### 2. 安装依赖
```bash
# 安装前端依赖
npm install

# 编译智能合约
npx hardhat compile
```

### 测试步骤

#### 前端测试
```bash
npm test
```

#### 合约测试
```bash
npx hardhat test
```

### 部署指南

#### 1. 部署智能合约到测试网
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

#### 2. 更新前端合约地址
将部署后的合约地址更新到 `src/contractInfo.js` 文件中

#### 3. 启动前端开发服务器
```bash
npm start
```

## GitHub发布指南

### 1. 准备工作
1. 在GitHub上创建新仓库
2. 确保本地项目已初始化Git仓库
```bash
git init
git add .
git commit -m "Initial commit: Task Reward Platform project"
```

### 2. 推送到GitHub
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 3. GitHub Pages部署 (可选)
如果需要通过GitHub Pages托管前端页面:
1. 修改`package.json`添加 homepage 字段:
```json
"homepage": "https://<your-username>.github.io/<repo-name>/"
```
2. 安装gh-pages依赖:
```bash
npm install --save gh-pages
```
3. 添加部署脚本到package.json:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```
4. 执行部署:
```bash
npm run deploy
```

### 注意事项

#### 安全提示
- **不要提交敏感信息**：私钥、API密钥等敏感信息应存储在`.env`文件中，确保该文件已添加到`.gitignore`
- **使用测试网**：开发和测试阶段始终使用以太坊测试网，避免使用主网ETH
- **合约审计**：正式部署前建议进行智能合约审计

#### 环境配置
创建`.env`文件并添加以下内容（根据需要）：
```
INFURA_API_KEY=your_infura_api_key
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
```

#### Hardhat网络配置
修改`hardhat.config.js`添加测试网配置：
```javascript
module.exports = {
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/\${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
}
```

### GitHub最佳实践
- 使用语义化提交信息 (如: feat:, fix:, docs:)
- 创建分支进行功能开发，完成后通过Pull Request合并
- 使用Issues跟踪任务和bug
- 定期更新依赖以修复安全漏洞

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
