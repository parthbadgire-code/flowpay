// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FlowPayWallet
 * @notice Accepts multiple ERC20 tokens and native MATIC, tracks a unified INR balance
 * @dev Deploy on Polygon Amoy testnet for hackathon demo
 */
contract FlowPayWallet is Ownable, ReentrancyGuard {
    // ─── State ────────────────────────────────────────────────────────────
    mapping(address => uint256) public flowPayBalanceINR;         // user => INR balance (scaled x100)
    mapping(address => mapping(address => uint256)) public tokenDeposits; // user => token => amount

    // Supported tokens on Polygon Amoy
    address public constant USDC  = 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582;
    address public constant WETH  = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;

    // ─── Events ───────────────────────────────────────────────────────────
    event Deposited(address indexed user, address indexed token, uint256 amount, uint256 inrValue);
    event MaticDeposited(address indexed user, uint256 amount, uint256 inrValue);
    event Spent(address indexed user, uint256 inrAmount, address indexed merchant);

    constructor() Ownable(msg.sender) {}

    // ─── Deposit ERC20 ────────────────────────────────────────────────────
    function depositToken(
        address token,
        uint256 amount,
        uint256 inrValueScaled // INR * 100 to avoid decimals
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        tokenDeposits[msg.sender][token] += amount;
        flowPayBalanceINR[msg.sender] += inrValueScaled;

        emit Deposited(msg.sender, token, amount, inrValueScaled);
    }

    // ─── Deposit Native MATIC ─────────────────────────────────────────────
    function depositMatic(uint256 inrValueScaled) external payable nonReentrant {
        require(msg.value > 0, "Must send MATIC");
        flowPayBalanceINR[msg.sender] += inrValueScaled;
        emit MaticDeposited(msg.sender, msg.value, inrValueScaled);
    }

    // ─── Spend (simulated) ────────────────────────────────────────────────
    function spend(address merchant, uint256 inrAmountScaled) external nonReentrant {
        require(flowPayBalanceINR[msg.sender] >= inrAmountScaled, "Insufficient FlowPay balance");
        flowPayBalanceINR[msg.sender] -= inrAmountScaled;
        emit Spent(msg.sender, inrAmountScaled, merchant);
    }

    // ─── View ─────────────────────────────────────────────────────────────
    function getBalance(address user) external view returns (uint256 inrBalanceScaled) {
        return flowPayBalanceINR[user];
    }

    // ─── Admin ────────────────────────────────────────────────────────────
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    function withdrawMatic() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
