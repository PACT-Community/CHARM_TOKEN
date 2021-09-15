// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract StandartToken is ERC20Pausable, Ownable{
    event Mint(address indexed from, address indexed to, uint256 value);
    event Burn(address indexed burner, uint256 value);

	
    constructor(string memory _name, string memory _symbol, uint256 _supply) ERC20(_name, _symbol){
        _mint(msg.sender, _supply * 10**18);
    }
	
	function burn(uint256 _value) public {
		_burn(msg.sender, _value);
        emit Burn(msg.sender, _value);
	}


    function mint(address account, uint256 amount) onlyOwner public {
        _mint(account, amount);
        emit Mint(address(0), account, amount);
    }


    function toggleTransferPause() onlyOwner public  {
        paused() ? _unpause() : _pause();
    }
    
}