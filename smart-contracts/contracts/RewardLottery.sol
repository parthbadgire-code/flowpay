// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract RewardLottery is VRFConsumerBaseV2Plus {
    address[] public participants;
    mapping(address => uint256) public ticketCount;
    mapping(address => uint256) public winnings;
    
    address public lastWinner;
    bool public drawInProgress;
    
    uint256 public immutable s_subscriptionId;
    bytes32 public immutable keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    address constant VRF_COORDINATOR = 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    
    uint16 constant requestConfirmations = 3;
    uint32 constant callbackGasLimit = 100000;
    uint32 constant numWords = 1;
    
    uint256 public lastRequestId;

    event ParticipantAdded(address indexed user, uint256 totalTickets);
    event WinnerRequested(uint256 indexed requestId);
    event WinnerSelected(address indexed winner, uint256 prize);

    constructor(uint256 subscriptionId) VRFConsumerBaseV2Plus(VRF_COORDINATOR) {
        s_subscriptionId = subscriptionId;
    }

    function addParticipant(address user) external {
        participants.push(user);
        ticketCount[user] += 1;
        emit ParticipantAdded(user, ticketCount[user]);
    }

    function requestWinner() external onlyOwner {
        require(participants.length > 0, "No participants in the pool");
        require(!drawInProgress, "Draw already in progress");
        
        drawInProgress = true;
        
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        
        lastRequestId = requestId;
        emit WinnerRequested(requestId);
    }

    function fulfillRandomWords(
        uint256 /*_requestId*/,
        uint256[] calldata _randomWords
    ) internal override {
        require(drawInProgress, "No draw in progress");
        require(participants.length > 0, "No participants");

        uint256 winnerIndex = _randomWords[0] % participants.length;
        address winnerAddress = participants[winnerIndex];
        
        lastWinner = winnerAddress;
        
        // Winner gets 100 mINR (using 18 decimals assumed matching standard ERC20)
        // Core requirement: store as uint256
        uint256 prizeAmount = 100 * 10**18;
        winnings[winnerAddress] += prizeAmount;
        
        // Reset everything
        for (uint i = 0; i < participants.length; i++) {
            ticketCount[participants[i]] = 0;
        }
        delete participants;
        drawInProgress = false;
        
        emit WinnerSelected(winnerAddress, prizeAmount);
    }

    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    function getParticipantCount() external view returns (uint256) {
        return participants.length;
    }

    function getMyWinnings(address user) external view returns (uint256) {
        return winnings[user];
    }
}
