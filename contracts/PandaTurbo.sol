// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PandaTurbo
 * @dev Turbo释放合约
 * 
 * 三种模式:
 * - Direct (直接): 20% 手续费, 即时释放
 * - 30Days (30天): 10% 手续费, 30天线性释放
 * - 60Days (60天): 0% 手续费, 60天线性释放
 */
contract PandaTurbo is Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public pandaToken;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 duration;
        uint256 released;
        uint256 fee;
        uint8 mode;
        bool exists;
    }
    
    mapping(address => Stake[]) public stakes;
    
    uint256 public constant DIRECT_FEE = 200;
    uint256 public constant DAYS30_FEE = 100;
    uint256 public constant DAYS60_FEE = 0;
    
    event Staked(address indexed user, uint256 amount, uint8 mode, uint256 fee);
    event Released(address indexed user, uint256 index, uint256 amount);
    event Withdrawn(address indexed user, uint256 totalAmount);
    
    constructor(address _pandaToken) Ownable(msg.sender) {
        pandaToken = IERC20(_pandaToken);
    }
    
    function stake(uint256 amount, uint8 mode) external {
        require(amount > 0, "Amount > 0");
        require(mode <= 2, "Invalid mode");
        
        uint256 fee = _calculateFee(amount, mode);
        uint256 actualStake = amount - fee;
        
        pandaToken.safeTransferFrom(msg.sender, owner(), fee);
        
        uint256 duration = mode == 0 ? 0 : (mode == 1 ? 30 days : 60 days);
        
        pandaToken.safeTransferFrom(msg.sender, address(this), actualStake);
        
        stakes[msg.sender].push(Stake({
            amount: actualStake,
            startTime: block.timestamp,
            duration: duration,
            released: 0,
            fee: fee,
            mode: mode,
            exists: true
        }));
        
        emit Staked(msg.sender, amount, mode, fee);
    }
    
    function release(uint256 stakeIndex) external {
        Stake storage s = stakes[msg.sender][stakeIndex];
        require(s.exists, "Invalid stake");
        
        uint256 releasable = getReleasableAmount(msg.sender, stakeIndex);
        require(releasable > 0, "Nothing to release");
        
        s.released += releasable;
        pandaToken.safeTransfer(msg.sender, releasable);
        
        emit Released(msg.sender, stakeIndex, releasable);
    }
    
    function _calculateFee(uint256 amount, uint8 mode) internal pure returns (uint256) {
        if (mode == 0) return (amount * DIRECT_FEE) / 1000;
        if (mode == 1) return (amount * DAYS30_FEE) / 1000;
        return 0;
    }
    
    function getFee(uint8 mode) external pure returns (uint256) {
        if (mode == 0) return DIRECT_FEE;
        if (mode == 1) return DAYS30_FEE;
        return DAYS60_FEE;
    }
    
    function getReleasableAmount(address user, uint256 stakeIndex) public view returns (uint256) {
        Stake storage s = stakes[user][stakeIndex];
        if (!s.exists) return 0;
        
        if (s.mode == 0) return s.amount - s.released;
        
        uint256 elapsed = block.timestamp - s.startTime;
        if (elapsed >= s.duration) return s.amount - s.released;
        
        uint256 releasable = (s.amount * elapsed) / s.duration;
        return releasable - s.released;
    }
    
    function getStakeCount(address user) external view returns (uint256) {
        return stakes[user].length;
    }
}
