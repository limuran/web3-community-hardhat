// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MetaCoin is ERC20 {
    // 给代币设定一个名字
    string public constant NAME = "LueLueLueERC20Token";
    // 给代币设定一个缩写
    string public constant SYMBOL = "Lue";
    //初始发行量
    uint256 public constant INITIAL_SUPPLY = 10000;
    constructor() ERC20(NAME, SYMBOL) {
        //将初始发行量的代币全部发送给部署的创建者
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }
}
