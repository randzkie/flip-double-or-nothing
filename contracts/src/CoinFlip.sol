// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CoinFlip
 * @notice A Web3 coin-flip betting game on Ritual Chain.
 *         Players bet HEADS or TAILS with RITUAL tokens.
 *         Win rate: 30% | Payout: Double or Nothing (2x)
 *         Min bet: 0.001 RITUAL | Max bet: 0.005 RITUAL
 */
contract CoinFlip {
    // ─── State Variables ───────────────────────────────────────
    address public owner;
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET = 0.005 ether;
    uint256 public constant WIN_PERCENTAGE = 45; // 30 out of 100

    mapping(address => string) public usernames;
    mapping(address => uint256) public totalBets;
    mapping(address => uint256) public totalWins;
    mapping(address => uint256) public totalLosses;
    mapping(address => uint256) public totalWagered;
    mapping(address => uint256) public totalWon;

    uint256 public globalBets;
    uint256 public globalWins;
    uint256 public globalLosses;

    // ─── Structs ───────────────────────────────────────────────
    struct FlipResult {
        address player;
        uint256 amount;
        bool choice;    // true = HEADS, false = TAILS
        bool won;       // true = player won
        uint256 payout;
        uint256 timestamp;
    }

    FlipResult[] public flipHistory;

    // ─── Events ────────────────────────────────────────────────
    event Flipped(
        address indexed player,
        uint256 amount,
        bool choice,
        bool won,
        uint256 payout
    );
    event Funded(address indexed owner, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);
    event UsernameSet(address indexed player, string username);

    // ─── Modifiers ─────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ─── External Functions ────────────────────────────────────

    /**
     * @notice Set or update your display username (required before playing)
     * @param _username The display name (1-20 characters)
     */
    function setUsername(string calldata _username) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(_username).length <= 20, "Username too long (max 20)");
        usernames[msg.sender] = _username;
        emit UsernameSet(msg.sender, _username);
    }

    /**
     * @notice Place a coin flip bet
     * @param _choice true = HEADS (cat), false = TAILS (ritual logo)
     * @dev 30% chance to win. Payout is 2x the bet amount.
     */
    function flip(bool _choice) external payable {
        require(msg.value >= MIN_BET, "Bet below minimum (0.001)");
        require(msg.value <= MAX_BET, "Bet above maximum (0.005)");
        require(
            bytes(usernames[msg.sender]).length > 0,
            "Set username first"
        );
        require(
            address(this).balance >= msg.value * 2,
            "Contract has insufficient funds to pay out"
        );

        // ── Pseudo-randomness ──────────────────────────────
        // NOTE: On-chain randomness is not truly secure.
        // For production, use Chainlink VRF or Ritual's
        // TEE-verified random precompile.
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    tx.origin,
                    totalBets[msg.sender],
                    flipHistory.length,
                    gasleft()
                )
            )
        ) % 100;

        bool won = random < WIN_PERCENTAGE;
        uint256 payout = 0;

        if (won) {
            // Player wins — double or nothing (2x payout)
            payout = msg.value * 2;
            totalWins[msg.sender]++;
            totalWon[msg.sender] += payout;
            globalWins++;

            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Winner payment failed");
        } else {
            // Player loses — bet stays in contract
            totalLosses[msg.sender]++;
            globalLosses++;
        }

        totalBets[msg.sender]++;
        totalWagered[msg.sender] += msg.value;
        globalBets++;

        flipHistory.push(
            FlipResult({
                player: msg.sender,
                amount: msg.value,
                choice: _choice,
                won: won,
                payout: payout,
                timestamp: block.timestamp
            })
        );

        emit Flipped(msg.sender, msg.value, _choice, won, payout);
    }

    /**
     * @notice Owner funds the contract bankroll
     */
    function fundContract() external payable onlyOwner {
        emit Funded(msg.sender, msg.value);
    }

    /**
     * @notice Owner withdraws profits from the contract
     * @param _amount Amount to withdraw in wei
     */
    function withdrawProfit(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(owner, _amount);
    }

    /**
     * @notice Emergency: transfer ownership
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        owner = _newOwner;
    }

    // ─── View Functions ────────────────────────────────────────

    /**
     * @notice Get the contract's current bankroll balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get a player's stats
     */
    function getPlayerStats(address _player)
        external
        view
        returns (
            string memory username,
            uint256 bets,
            uint256 wins,
            uint256 losses,
            uint256 wagered,
            uint256 won
        )
    {
        return (
            usernames[_player],
            totalBets[_player],
            totalWins[_player],
            totalLosses[_player],
            totalWagered[_player],
            totalWon[_player]
        );
    }

    /**
     * @notice Get total number of flips
     */
    function getTotalFlips() external view returns (uint256) {
        return flipHistory.length;
    }

    /**
     * @notice Get recent flip history (pagination)
     * @param _offset Starting index (0 = most recent)
     * @param _limit Number of results (max 50)
     */
    function getRecentFlips(uint256 _offset, uint256 _limit)
        external
        view
        returns (FlipResult[] memory)
    {
        if (_limit > 50) _limit = 50;
        uint256 total = flipHistory.length;
        if (_offset >= total) {
            return new FlipResult[](0);
        }

        uint256 remaining = total - _offset;
        uint256 count = remaining < _limit ? remaining : _limit;
        FlipResult[] memory results = new FlipResult[](count);

        for (uint256 i = 0; i < count; i++) {
            results[i] = flipHistory[total - 1 - _offset - i];
        }

        return results;
    }

    /**
     * @notice Check if contract can accept a bet of given size
     */
    function canAcceptBet(uint256 _amount) external view returns (bool) {
        return
            _amount >= MIN_BET &&
            _amount <= MAX_BET &&
            address(this).balance >= _amount * 2;
    }

    /**
     * @notice Get global game stats
     */
    function getGlobalStats()
        external
        view
        returns (
            uint256 bets,
            uint256 wins,
            uint256 losses,
            uint256 contractBalance
        )
    {
        return (globalBets, globalWins, globalLosses, address(this).balance);
    }

    // ─── Receive ───────────────────────────────────────────────
    receive() external payable onlyOwner {
        emit Funded(msg.sender, msg.value);
    }
}
