// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// Interfaces for our custom mock contracts
interface IMockINR {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
}

interface IMockPriceOracle {
    function getPrice(address token) external view returns (uint256);
}

contract CollateralManager is Ownable, ReentrancyGuard {
    IMockINR public mINR;
    IMockPriceOracle public oracle;

    uint256 public constant CRYPTO_LTV = 50;        // 50% for ERC-20 tokens
    uint256 public constant NFT_LTV = 40;           // 40% for NFTs
    uint256 public constant NFT_FLOOR_HAIRCUT = 70; // use 70% of floor price
    uint256 public constant LIQ_THRESHOLD = 75;     // liquidate when LTV > 75%
    uint256 public constant LIQ_BONUS = 5;          // 5% bonus for liquidating
    uint256 public constant ORIGINATION_FEE = 15;   // 1.5% (out of 1000)
    uint256 public constant INTEREST_RATE_APR = 6;  // 6% APR (out of 100)

    uint256 public positionCounter;

    struct Position {
        uint256 id;
        address borrower;
        address collateralContract; // ERC-20 address or NFT contract address
        uint256 collateralAmount;   // token amount (for ERC-20) or tokenId (for NFT)
        bool isNFT;
        uint256 creditIssued;       // mINR issued (18 decimals)
        uint256 originationFee;     // fee taken at creation
        uint256 createdAt;          // block.timestamp
        uint256 repayBy;            // createdAt + 7 days
        bool active;
        bool liquidated;
    }

    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;

    event PositionOpened(uint256 indexed positionId, address indexed borrower, uint256 creditIssued);
    event PositionRepaid(uint256 indexed positionId, address indexed borrower, uint256 totalRepaid);
    event PositionLiquidated(uint256 indexed positionId, address liquidator, uint256 bonus);
    event CollateralLocked(address indexed token, uint256 amountOrId, bool isNFT);

    constructor(address _mINR, address _oracle) Ownable(msg.sender) {
        mINR = IMockINR(_mINR);
        oracle = IMockPriceOracle(_oracle);
    }

    /// @notice Open a new position using ERC20 collateral
    /// @param tokenAddress The ERC20 token address
    /// @param tokenAmount The amount of tokens to lock
    /// @param paymentAmount The amount of mINR credit requested
    function openPositionERC20(
        address tokenAddress,
        uint256 tokenAmount,
        uint256 paymentAmount
    ) external nonReentrant {
        // Transfer collateral to this contract
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), tokenAmount);
        emit CollateralLocked(tokenAddress, tokenAmount, false);

        // Get oracle price
        uint256 oraclePrice = oracle.getPrice(tokenAddress);
        require(oraclePrice > 0, "Oracle price not set");

        // Step 1: Calculate collateral value in INR (8 decimal precision from oracle scaled out)
        uint256 collateralValueINR = (tokenAmount * oraclePrice) / 1e8;
        
        // Step 2: Calculate max gross credit given 50% LTV limit
        uint256 grossCredit = (collateralValueINR * CRYPTO_LTV) / 100;
        
        require(grossCredit >= paymentAmount, "Insufficient collateral for requested credit");

        // Step 3: Calculate the origination fee from the requested credit amount
        uint256 originationFee = (paymentAmount * ORIGINATION_FEE) / 1000;
        
        // Step 4: Calculate net credit to issue to the user
        uint256 netCredit = paymentAmount - originationFee;

        // Store standard position details
        positionCounter++;
        positions[positionCounter] = Position({
            id: positionCounter,
            borrower: msg.sender,
            collateralContract: tokenAddress,
            collateralAmount: tokenAmount,
            isNFT: false,
            creditIssued: paymentAmount, // Gross credit issued tracks total debt
            originationFee: originationFee,
            createdAt: block.timestamp,
            repayBy: block.timestamp + 7 days,
            active: true,
            liquidated: false
        });

        userPositions[msg.sender].push(positionCounter);

        // Mint fees to protocol treasury (this contract) and net credit to user
        mINR.mint(address(this), originationFee);
        mINR.mint(msg.sender, netCredit);

        emit PositionOpened(positionCounter, msg.sender, paymentAmount);
    }

    /// @notice Open a new position using ERC721 NFT collateral
    /// @param nftContract The ERC721 contract address
    /// @param tokenId The NFT token ID to lock
    /// @param paymentAmount The amount of mINR credit requested
    function openPositionNFT(
        address nftContract,
        uint256 tokenId,
        uint256 paymentAmount
    ) external nonReentrant {
        // Transfer NFT to this contract
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
        emit CollateralLocked(nftContract, tokenId, true);

        // Get oracle price for NFT floor
        uint256 floorPrice = oracle.getPrice(nftContract);
        require(floorPrice > 0, "Oracle floor price not set");

        // Step 1: Calculate conservative floor based on haircut. Scale up to 18 decimals from 8 decimals.
        uint256 conservativeFloor = (floorPrice * NFT_FLOOR_HAIRCUT * 1e10) / 100;
        
        // Step 2: Calculate max gross credit given 40% LTV limit on the conservative floor
        uint256 grossCredit = (conservativeFloor * NFT_LTV) / 100;

        require(grossCredit >= paymentAmount, "Insufficient collateral for requested credit");

        // Step 3: Calculate the origination fee
        uint256 originationFee = (paymentAmount * ORIGINATION_FEE) / 1000;
        
        // Step 4: Calculate net credit to issue to the user
        uint256 netCredit = paymentAmount - originationFee;

        // Store standard position details
        positionCounter++;
        positions[positionCounter] = Position({
            id: positionCounter,
            borrower: msg.sender,
            collateralContract: nftContract,
            collateralAmount: tokenId,
            isNFT: true,
            creditIssued: paymentAmount,
            originationFee: originationFee,
            createdAt: block.timestamp,
            repayBy: block.timestamp + 7 days,
            active: true,
            liquidated: false
        });

        userPositions[msg.sender].push(positionCounter);

        // Mint fees to protocol treasury (this contract) and net credit to user
        mINR.mint(address(this), originationFee);
        mINR.mint(msg.sender, netCredit);

        emit PositionOpened(positionCounter, msg.sender, paymentAmount);
    }

    /// @notice Repay loan with interest to unlock collateral
    /// @param positionId The ID of the active position
    function repayPosition(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(pos.active, "Position inactive");
        require(pos.borrower == msg.sender, "Not borrower");

        // Calculate interest natively
        uint256 daysElapsed = (block.timestamp - pos.createdAt) / 86400;
        uint256 interest = (pos.creditIssued * INTEREST_RATE_APR * daysElapsed) / 365 / 100;
        
        uint256 totalRepay = pos.creditIssued + interest;

        // User must have approved interest amount of mINR to us
        // Burn the exact debt principal to remove it from system. Since originationFee
        // was minted to the treasury, burn that from the treasury, and netCredit from the user.
        mINR.burn(msg.sender, pos.creditIssued - pos.originationFee); 
        mINR.burn(address(this), pos.originationFee); 
        if (interest > 0) {
            // Collect protocol interest directly into treasury
            IERC20(address(mINR)).transferFrom(msg.sender, address(this), interest);
        }

        // Return the collateral
        if (pos.isNFT) {
            IERC721(pos.collateralContract).transferFrom(address(this), pos.borrower, pos.collateralAmount);
        } else {
            IERC20(pos.collateralContract).transfer(pos.borrower, pos.collateralAmount);
        }

        pos.active = false;
        emit PositionRepaid(positionId, msg.sender, totalRepay);
    }

    /// @notice Liquidate undercollateralized or expired positions
    /// @param positionId The ID of the active position
    function liquidatePosition(uint256 positionId) external nonReentrant {
        Position storage pos = positions[positionId];
        require(pos.active, "Position inactive");

        uint256 hp = getHealthFactor(positionId);
        bool isExpired = block.timestamp > pos.repayBy;

        require(hp < 100 || isExpired, "Not liquidatable");

        uint256 oraclePrice = oracle.getPrice(pos.collateralContract);
        uint256 currentCollateralValue;
        
        if (pos.isNFT) {
            currentCollateralValue = oraclePrice * 1e10; // Full floor value mapped to 1e18
        } else {
            currentCollateralValue = (pos.collateralAmount * oraclePrice) / 1e8;
        }

        // Step 1: Calculate liquidation bonus
        uint256 liquidationBonus = (currentCollateralValue * LIQ_BONUS) / 100;
        
        // Step 2: Liquidator repays exact base debt principal
        uint256 debtToRepay = pos.creditIssued;

        // Step 3: Determine surplus to refund borrower
        uint256 surplus = 0;
        if (currentCollateralValue > (debtToRepay + liquidationBonus)) {
            surplus = currentCollateralValue - debtToRepay - liquidationBonus;
        }

        // Action 1: Burn liquidator's mINR to clear bad debt
        mINR.burn(msg.sender, debtToRepay);

        // Action 2: Send full collateral to liquidator (they receive collateral containing the bonus margin)
        if (pos.isNFT) {
            IERC721(pos.collateralContract).transferFrom(address(this), msg.sender, pos.collateralAmount);
        } else {
            IERC20(pos.collateralContract).transfer(msg.sender, pos.collateralAmount);
        }

        // Action 3: Mint surplus value back to original borrower in mINR
        if (surplus > 0) {
            mINR.mint(pos.borrower, surplus);
        }

        pos.active = false;
        pos.liquidated = true;
        
        emit PositionLiquidated(positionId, msg.sender, liquidationBonus);
    }

    /// @notice Scaled health factor (100 = HF 1.0)
    /// @param positionId ID of position
    function getHealthFactor(uint256 positionId) public view returns (uint256) {
        Position storage pos = positions[positionId];
        if (!pos.active) return 0;

        uint256 currentCollateralValue;
        uint256 oraclePrice = oracle.getPrice(pos.collateralContract);
        
        if (pos.isNFT) {
            // For NFT, apply haircut to the floor price to simulate its locked value baseline
            currentCollateralValue = (oraclePrice * NFT_FLOOR_HAIRCUT * 1e10) / 100;
        } else {
            // For ERC20
            currentCollateralValue = (pos.collateralAmount * oraclePrice) / 1e8;
        }

        // Simplification mathematically required by spec:
        // hf = (currentCollateralValue * liquidationThreshold) / creditIssued
        if (pos.creditIssued == 0) return type(uint256).max;
        
        return (currentCollateralValue * LIQ_THRESHOLD) / pos.creditIssued;
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function getTreasuryBalance() external view returns (uint256) {
        return IERC20(address(mINR)).balanceOf(address(this));
    }

    function withdrawTreasury(uint256 amount) external onlyOwner {
        IERC20(address(mINR)).transfer(owner(), amount);
    }
}
