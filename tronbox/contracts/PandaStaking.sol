// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PandaStaking
 * @dev Staking contract with 30/60/90 day lock periods
 */
contract PandaStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Token interfaces
    IERC20 public stakingToken;
    IERC20 public rewardToken;
    
    // Staking periods (in seconds)
    uint256 public constant LOCK_PERIOD_30 = 30 days;
    uint256 public constant LOCK_PERIOD_60 = 60 days;
    uint256 public constant LOCK_PERIOD_90 = 90 days;
    
    // Annual reward rates (in basis points)
    uint256 public constant RATE_30 = 1500;  // 15%
    uint256 public constant RATE_60 = 4500;  // 45%
    uint256 public constant RATE_90 = 9000;  // 90%
    
    // Staker info
    struct StakerInfo {
        uint256 stakedAmount;
        uint256 startTime;
        uint256 lockPeriod;
        uint256 pendingRewards;
        bool claimed;
    }
    
    // Mapping from user to staking info
    mapping(address => StakerInfo[]) public stakers;
    
    // Total staked amount
    uint256 public totalStaked;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardClaimed(address indexed user, uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Stake tokens with lock period
     * @param amount Amount to stake
     * @param lockPeriod Lock period (30, 60, or 90 days)
     */
    function stake(uint256 amount, uint256 lockPeriod) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        require(
            lockPeriod == LOCK_PERIOD_30 || 
            lockPeriod == LOCK_PERIOD_60 || 
            lockPeriod == LOCK_PERIOD_90,
            "Invalid lock period"
        );
        
        // Transfer tokens from user
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate pending rewards
        uint256 rewardRate = _getRewardRate(lockPeriod);
        uint256 yearlyReward = (amount * rewardRate) / 10000;
        uint256 pendingRewards = (yearlyReward * lockPeriod) / (365 days);
        
        // Store staking info
        stakers[msg.sender].push(StakerInfo({
            stakedAmount: amount,
            startTime: block.timestamp,
            lockPeriod: lockPeriod,
            pendingRewards: pendingRewards,
            claimed: false
        }));
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, lockPeriod);
    }
    
    /**
     * @dev Unstake after lock period
     * @param stakingIndex Index of staking in user's array
     */
    function unstake(uint256 stakingIndex) external nonReentrant {
        StakerInfo storage info = stakers[msg.sender][stakingIndex];
        require(info.stakedAmount > 0, "Nothing to unstake");
        require(block.timestamp >= info.startTime + info.lockPeriod, "Lock period not ended");
        require(!info.claimed, "Already claimed");
        
        uint256 amount = info.stakedAmount;
        uint256 rewards = info.pendingRewards;
        
        // Mark as claimed
        info.claimed = true;
        
        // Transfer staked tokens and rewards
        stakingToken.safeTransfer(msg.sender, amount);
        
        // Claim rewards (from reward pool)
        if (rewards > 0) {
            rewardToken.safeTransfer(msg.sender, rewards);
            emit RewardClaimed(msg.sender, rewards);
        }
        
        totalStaked -= amount;
        
        emit Unstaked(msg.sender, amount, rewards);
    }
    
    /**
     * @dev Get staking info for a user
     */
    function getStakerInfo(address user) external view returns (StakerInfo[] memory) {
        return stakers[user];
    }
    
    /**
     * @dev Get pending rewards for a staker
     */
    function calculateRewards(address user, uint256 stakingIndex) external view returns (uint256) {
        StakerInfo storage info = stakers[user][stakingIndex];
        if (info.claimed || info.stakedAmount == 0) {
            return 0;
        }
        
        // If lock period ended, return full rewards
        if (block.timestamp >= info.startTime + info.lockPeriod) {
            return info.pendingRewards;
        }
        
        // Calculate proportional rewards
        uint256 elapsed = block.timestamp - info.startTime;
        return (info.pendingRewards * elapsed) / info.lockPeriod;
    }
    
    /**
     * @dev Get reward rate for a lock period
     */
    function _getRewardRate(uint256 lockPeriod) internal pure returns (uint256) {
        if (lockPeriod == LOCK_PERIOD_30) return RATE_30;
        if (lockPeriod == LOCK_PERIOD_60) return RATE_60;
        return RATE_90;
    }
    
    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}
