// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TaskRewardPlatform
 * @dev A decentralized platform for creating and completing tasks with ETH rewards
 */
contract TaskRewardPlatform {
    struct Task {
        address creator;
        string title;
        string description;
        uint256 reward;
        uint256 deadline;
        TaskStatus status;
        address solver;
    }

    enum TaskStatus { Open, InProgress, Completed, Cancelled }

    // Platform fee percentage (0.5%)
    uint256 public constant PLATFORM_FEE_PERCENT = 5;
    uint256 public constant PLATFORM_FEE_DIVISOR = 1000;
    address public owner;

    mapping(uint256 => Task) public tasks;
    mapping(address => uint256[]) public userCreatedTasks;
    mapping(address => uint256[]) public userSolvedTasks;
    uint256 public taskCount;
    uint256 public platformBalance;

    event TaskCreated(uint256 indexed taskId, address indexed creator, string title, uint256 reward, uint256 deadline);
    event TaskTaken(uint256 indexed taskId, address indexed solver);
    event TaskCompleted(uint256 indexed taskId, address indexed solver, uint256 reward);
    event TaskCancelled(uint256 indexed taskId, address indexed creator);
    event TaskDeadlineExtended(uint256 indexed taskId, uint256 newDeadline);
    event FeeWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyTaskCreator(uint256 _taskId) {
        require(tasks[_taskId].creator == msg.sender, "Only task creator can call this function");
        _;
    }

    modifier onlyTaskSolver(uint256 _taskId) {
        require(tasks[_taskId].solver == msg.sender, "Only task solver can call this function");
        _;
    }

    modifier taskExists(uint256 _taskId) {
        require(_taskId > 0 && _taskId <= taskCount, "Task does not exist");
        _;
    }

    modifier taskOpen(uint256 _taskId) {
        require(tasks[_taskId].status == TaskStatus.Open, "Task is not open");
        _;
    }

    modifier taskInProgress(uint256 _taskId) {
        require(tasks[_taskId].status == TaskStatus.InProgress, "Task is not in progress");
        _;
    }

    modifier notExpired(uint256 _taskId) {
        require(tasks[_taskId].deadline > block.timestamp, "Task deadline has expired");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Creates a new task with a reward
     * @param _title Task title
     * @param _description Task description
     * @param _deadline Unix timestamp for task deadline
     */
    function createTask(string memory _title, string memory _description, uint256 _deadline) public payable {
        require(msg.value > 0, "Reward must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        // Calculate platform fee
        uint256 fee = (msg.value * PLATFORM_FEE_PERCENT) / PLATFORM_FEE_DIVISOR;
        uint256 taskReward = msg.value - fee;

        // Add fee to platform balance
        platformBalance += fee;

        taskCount++;
        tasks[taskCount] = Task({
            creator: msg.sender,
            title: _title,
            description: _description,
            reward: taskReward,
            deadline: _deadline,
            status: TaskStatus.Open,
            solver: address(0)
        });

        // Add to user's created tasks
        userCreatedTasks[msg.sender].push(taskCount);

        emit TaskCreated(taskCount, msg.sender, _title, taskReward, _deadline);
    }

    /**
     * @dev Take on a task
     * @param _taskId ID of the task to take
     */
    function takeTask(uint256 _taskId) public taskExists(_taskId) taskOpen(_taskId) notExpired(_taskId) {
        Task storage task = tasks[_taskId];
        task.solver = msg.sender;
        task.status = TaskStatus.InProgress;

        emit TaskTaken(_taskId, msg.sender);
    }

    /**
     * @dev Mark a task as completed (by solver)
     * @param _taskId ID of the task to mark as completed
     */
    function submitTask(uint256 _taskId) public taskExists(_taskId) taskInProgress(_taskId) onlyTaskSolver(_taskId) {
        Task storage task = tasks[_taskId];
        task.status = TaskStatus.Completed;

        // Add to user's solved tasks
        userSolvedTasks[msg.sender].push(_taskId);

        // Transfer reward to solver
        payable(msg.sender).transfer(task.reward);

        emit TaskCompleted(_taskId, msg.sender, task.reward);
    }

    /**
     * @dev Cancel a task and refund the reward (minus fee)
     * @param _taskId ID of the task to cancel
     */
    function cancelTask(uint256 _taskId) public taskExists(_taskId) onlyTaskCreator(_taskId) {
        Task storage task = tasks[_taskId];
        require(task.status == TaskStatus.Open, "Only open tasks can be cancelled");

        task.status = TaskStatus.Cancelled;

        // Refund the reward to creator
        payable(msg.sender).transfer(task.reward);

        emit TaskCancelled(_taskId, msg.sender);
    }

    /**
     * @dev Extend the deadline of a task
     * @param _taskId ID of the task
     * @param _newDeadline New deadline timestamp
     */
    function extendDeadline(uint256 _taskId, uint256 _newDeadline) public
        taskExists(_taskId)
        onlyTaskCreator(_taskId)
    {
        Task storage task = tasks[_taskId];
        require(
            task.status == TaskStatus.Open || task.status == TaskStatus.InProgress,
            "Cannot extend deadline of completed or cancelled tasks"
        );
        require(_newDeadline > task.deadline, "New deadline must be later than current deadline");

        task.deadline = _newDeadline;

        emit TaskDeadlineExtended(_taskId, _newDeadline);
    }

    /**
     * @dev Withdraw platform fees
     * @param _amount Amount to withdraw
     */
    function withdrawFees(uint256 _amount) public onlyOwner {
        require(_amount <= platformBalance, "Insufficient balance");

        platformBalance -= _amount;
        payable(owner).transfer(_amount);

        emit FeeWithdrawn(owner, _amount);
    }

    /**
     * @dev Get all tasks created by a user
     * @param _user Address of the user
     * @return taskIds Array of task IDs
     */
    function getCreatedTasks(address _user) public view returns (uint256[] memory taskIds) {
        return userCreatedTasks[_user];
    }

    /**
     * @dev Get all tasks solved by a user
     * @param _user Address of the user
     * @return taskIds Array of task IDs
     */
    function getSolvedTasks(address _user) public view returns (uint256[] memory taskIds) {
        return userSolvedTasks[_user];
    }

    /**
     * @dev Get task details
     * @param _taskId ID of the task
     * @return creator Address of the task creator
     * @return title Title of the task
     * @return description Description of the task
     * @return reward Reward amount for the task
     * @return deadline Deadline timestamp
     * @return status Status of the task as uint8
     * @return solver Address of the task solver
     */
    function getTaskDetails(uint256 _taskId)
        public
        view
        taskExists(_taskId)
        returns (
            address creator,
            string memory title,
            string memory description,
            uint256 reward,
            uint256 deadline,
            uint8 status,
            address solver
        )
    {
        Task storage task = tasks[_taskId];
        return (
            task.creator,
            task.title,
            task.description,
            task.reward,
            task.deadline,
            uint8(task.status),
            task.solver
        );
    }
}