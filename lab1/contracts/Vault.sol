pragma solidity ^0.8.28;

contract Vault {
    // the only address that can withdraw from this vaule
    address payable heir;

    event DepositEth(address _addr, uint _amount);

    constructor(address payable _heir) {
        heir = _heir;
    }

    receive() external payable {
        emit DepositEth(msg.sender, msg.value);
    }

    // function deposit() public payable {
    //     emit DepositEth(msg.sender, msg.value);
    // }

    function withdraw() public {
        require(msg.sender == heir, "Only vault heir can withdraw");
        heir.transfer(address(this).balance);
    }
}