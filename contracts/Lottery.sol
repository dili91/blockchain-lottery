// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Lottery {

    address public manager;

    address[] public players;

    constructor(){
        manager = msg.sender;
    }

    function join() public payable {
        require(msg.value > 0.01 ether);
        players.push(msg.sender);
    }

    function getPlayers() public view returns (address[] memory){
        return players;
    }

    // pick a winner and send the whole money linked to this contract (this.balance) to a random winner
    function pickWinner() public isManager{
        address winner = players[random() % players.length];
        payable(winner).transfer(address(this).balance);
        players = new address[](0);
    }

    // pseudo random function generator. It's weak by design as all the inputs can be guessed ahead of time: 
    // the block difficulty is public, as well as the timestamp and players are known to the players.
    function random() private view returns (uint){
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
    }

    //only a manager (AKA person that created the contract) can pick a winner
    modifier isManager(){
        require(msg.sender == manager);
        _;
    }
}