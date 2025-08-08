import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // 新增：导入ethers
import { contractAddress, contractABI } from './contractInfo'; // 新增：导入合约信息
import './App.css';

// 新增：一个帮助函数，用于格式化从合约返回的数据
// 注意！我们修改了 formatTask 来处理合约直接返回的结构
const formatTask = (task, taskId) => {
  // task[0] 是 creator, task[1] 是 title, 等等。
  return {
    id: taskId, // 我们需要手动传入ID
    creator: task[0],
    title: task[1],
    description: task[2],
    reward: ethers.formatEther(task[3]), // 将wei转换为ETH
    deadlineTimestamp: Number(task[4]),
    status: Number(task[5]),
    solver: task[6],
  };
};


const TaskRewardPlatform = () => {
  // 状态管理
  const [connected, setConnected] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null); // 新增：存储provider
  const [contract, setContract] = useState(null); // 新增：存储合约实例
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    deadline: ''
  });
  const [viewMode, setViewMode] = useState('all');
 
  // 新增：更新合约实例的函数
const updateContractInstance = async (newAccount) => {
  try {
    if (provider && newAccount) {
      const newSigner = await provider.getSigner();
      const newContractInstance = new ethers.Contract(contractAddress, contractABI, newSigner);
      setContract(newContractInstance);
      setAccount(newAccount);
      await loadTasks(newContractInstance);
    }
  } catch (error) {
    console.error("更新合约实例失败:", error);
  }
};

useEffect(() => {
  if (window.ethereum) {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        await updateContractInstance(accounts[0]); // ✅ 使用新函数
      } else {
        setConnected(false);
        setAccount('');
        setContract(null);
        setTasks([]);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }
}, [provider]);

  useEffect(() => {
  // 检查 window.ethereum 是否存在
  if (window.ethereum) {
    // 定义一个处理函数，当账户改变时被调用
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        // 如果有账户，更新我们的状态
        setAccount(accounts[0]);
        // 你甚至可以在这里重新加载任务，以反映新账户的视角
        // (但要确保 contract 实例已经存在)
      } else {
        // 如果用户断开了所有账户的连接
        setConnected(false);
        setAccount('');
        setContract(null);
      }
    };

    // 监听 'accountsChanged' 事件
    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // !! 重要：返回一个清理函数。
    // 这会在组件卸载时移除监听器，防止内存泄漏。
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }
}, []); // 空依赖数组意味着这个 effect 只在组件首次挂载时运行一次

 // 修改：连接钱包的函数
  const connectWallet = async () => {
    setLoading(true);
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        
        setProvider(provider);
        setAccount(accounts[0]); // 成功设置了账户
        setContract(contractInstance); // 成功设置了合约
        setConnected(true); // <-- 新增：在这里更新UI状态！

        await loadTasks(contractInstance); // 连接成功后加载任务
      } else {
        alert("请安装MetaMask钱包！");
      }
    } catch (error) {
      console.error("连接钱包失败:", error);
    }
    setLoading(false);
  };

  // 新增：加载所有任务的函数
  const loadTasks = async (contractInstance) => {
  setLoading(true);
  try {
    // 1. 从合约获取任务总数
    // taskCount 是一个 public 变量，ethers.js 会为它创建一个同名函数
    const count = await contractInstance.taskCount();
    const taskCount = Number(count); // 将返回的 BigInt 转换为普通数字

    if (taskCount === 0) {
      setTasks([]); // 如果没有任务，直接设置为空数组并返回
      setLoading(false);
      return;
    }
    
    // 2. 准备一个数组来存放所有任务的查询 Promise
    const taskPromises = [];
    // 您的合约 taskCount 从 1 开始，所以我们循环从 1 到 taskCount
    for (let i = 1; i <= taskCount; i++) {
      // tasks(id) 是一个 public mapping，ethers.js 也为它创建了函数
      taskPromises.push(contractInstance.tasks(i));
    }

    // 3. 使用 Promise.all 并行地一次性获取所有任务数据
    const allRawTasks = await Promise.all(taskPromises);

    // 4. 格式化我们刚刚获取到的数据
    const formattedTasks = allRawTasks
      .map((rawTask, index) => {
        const taskId = index + 1; // 因为数组索引从0开始，而我们的任务ID从1开始
        return formatTask(rawTask, taskId);
      })
      .sort((a, b) => b.id - a.id); // 按ID降序排列
      console.log('加载的任务数据:', formattedTasks); // 添加调试日志
    // 新增探针 #1: 在设置state之前，看看我们拿到了什么
    console.log("即将设置到state的任务数据 (formattedTasks):", formattedTasks);

    setTasks(formattedTasks);

  } catch (error) {
    console.error("加载任务失败:", error);
    alert("加载任务列表失败，请检查控制台错误。");
  }
  setLoading(false);
};

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

   // 修改：创建任务的函数
  const createTask = async (e) => {
    e.preventDefault();
    if (!contract) return;
    setLoading(true);
    try {
      const rewardInWei = ethers.parseEther(formData.reward); // 将ETH转换为wei
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);
      
      // 调用合约的createTask方法，并发送ETH作为悬赏
      const tx = await contract.createTask(
        formData.title,
        formData.description,
        deadlineTimestamp,
        { value: rewardInWei }
      );

      await tx.wait(); // 等待交易被矿工打包
      
      await loadTasks(contract); // 重新加载任务列表
      setShowCreateForm(false); // 关闭表单
    } catch (error) {
      console.error("创建任务失败:", error);
      alert("创建任务失败，请查看控制台获取详情。");
    }
    setLoading(false);
  };

  const takeTask = async (taskId) => {
    if(!contract) return;
    setLoading(true);
    try {
      const tx = await contract.takeTask(taskId);
      await tx.wait();
      await loadTasks(contract);
    } catch (error) {
      console.error("接受任务失败:", error);
    }
    setLoading(false);
  };

  const completeTask = async (taskId) => {
    if(!contract) return;
    setLoading(true);
    try {
      const tx = await contract.submitTask(taskId);  // ✅ 修正：使用正确的方法名
      await tx.wait();
      await loadTasks(contract);
    } catch (error) {
      console.error("提交任务失败:", error);  // 同时修正错误信息
    }
    setLoading(false);
};
  
  const cancelTask = async (taskId) => {
    if(!contract) return;
    setLoading(true);
    try {
      const tx = await contract.cancelTask(taskId);
      await tx.wait();
      await loadTasks(contract);
    } catch (error) {
      console.error("取消任务失败:", error);
    }
    setLoading(false);
};

  const getStatusText = (status) => ({0: '开放', 1: '进行中', 2: '已完成', 3: '已取消'}[status]);
 
  // App.js
const getFilteredTasks = () => {
  if (viewMode === 'all' || !account) return tasks; // 加个!account的保护
  // ✅ 修正：全部转为小写再比较
  const lowerCaseAccount = account.toLowerCase(); 
  return tasks.filter(task => {
      if (viewMode === 'my-created') return task.creator.toLowerCase() === lowerCaseAccount;
      if (viewMode === 'my-taken') return task.solver.toLowerCase() === lowerCaseAccount;
      return true;
  });
};


  const isExpired = (task) => !task.deadlineTimestamp || task.deadlineTimestamp < Math.floor(Date.now() / 1000);
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>去中心化任务悬赏平台 (UI原型)</h1>
        <div className="wallet-info">
          {connected ? (
            <>
              <span className="account-address">已连接: {`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
              <button className="button" onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? '收起表单' : '创建新任务'}
              </button>
            </>
          ) : (
            <button className="button connect-wallet" onClick={connectWallet}>
              {loading ? '连接中...' : '连接钱包'}
            </button>
          )}
        </div>
      </header>

      {loading && <div className="loading-overlay">处理中...</div>}
      
      <main className="app-main">
        {showCreateForm && connected && (
          <div className="create-form-container">
            <h2>发布一个新任务</h2>
            <form onSubmit={createTask} className="create-form">
                <div className="form-group"><label>任务标题*</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>悬赏金额 (ETH)*</label><input type="number" step="0.01" name="reward" value={formData.reward} onChange={handleInputChange} required /></div>
                <div className="form-group"><label>任务描述</label><textarea name="description" value={formData.description} onChange={handleInputChange}></textarea></div>
                <div className="form-group"><label>截止日期*</label><input type="datetime-local" name="deadline" value={formData.deadline} onChange={handleInputChange} required /></div>
                <div className="form-actions"><button type="submit" className="button">发布任务</button></div>
            </form>
          </div>
        )}

        <div className="controls">
            <div className="view-controls">
                <button onClick={() => setViewMode('all')} className={viewMode === 'all' ? 'active' : ''}>所有任务</button>
                {connected && <button onClick={() => setViewMode('my-created')} className={viewMode === 'my-created' ? 'active' : ''}>我创建的</button>}
                {connected && <button onClick={() => setViewMode('my-taken')} className={viewMode === 'my-taken' ? 'active' : ''}>我接受的</button>}
            </div>
        </div>

        <div className="tasks-container">
          {getFilteredTasks().length > 0 ? getFilteredTasks().map(task => (
            <div key={task.id} className={`task-card status-${task.status} ${isExpired(task) ? 'expired' : ''}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-status">
                  {isExpired(task) && task.status < 2 && <span className="expired-badge">已过期</span>}
                  <span className={`status-badge status-${task.status}`}>{getStatusText(task.status)}</span>
                </div>
              </div>
              <div className="task-content">
                <p className="task-description">{task.description}</p>
                <div className="task-details">
                  <div className="detail-item"><span className="detail-label">悬赏</span><span className="detail-value">{task.reward} ETH</span></div>
                  <div className="detail-item"><span className="detail-label">截止日期</span><span className="detail-value">{new Date(task.deadlineTimestamp * 1000).toLocaleString()}</span></div>
                  <div className="detail-item"><span className="detail-label">创建者</span><span className="detail-value">{`${task.creator.slice(0, 6)}...`}</span></div>
                  <div className="detail-item"><span className="detail-label">执行者</span><span className="detail-value">{task.solver.startsWith('0x000') ? 'N/A' : `${task.solver.slice(0, 6)}...`}</span></div>
                </div>
              </div>
              <div className="task-actions">
  {/* ✅ 修正：比较前转小写 */}
  {connected && task.status === 0 && !isExpired(task) && task.creator.toLowerCase() !== account.toLowerCase() && <button className="button" onClick={() => takeTask(task.id)}>接受任务</button>}
  {/* ✅ 修正：比较前转小写 */}
  {connected && task.status === 1 && task.solver.toLowerCase() === account.toLowerCase() && <button className="button" onClick={() => completeTask(task.id)}>提交完成</button>}
  {/* ✅ 修正：比较前转小写 */}
  {connected && task.status === 0 && task.creator.toLowerCase() === account.toLowerCase() && <button className="button cancel" onClick={() => cancelTask(task.id)}>取消任务</button>}
</div>
            </div>
          )) : <div className="no-tasks">没有找到相关任务。</div>}
        </div>
      </main>
    </div>
  );
};

export default TaskRewardPlatform;