// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Web3Dreamers is ERC1155, ERC1155Supply {
    uint256 private constant CAP = 10;
    uint256 public price;
    address private immutable OWNER;
    mapping(address => uint256) public allowedDiscount;

    constructor(address[] memory users,uint256 _price)
        ERC1155("ipfs://Qmaa6TuP2s9pSKczHF4rwWhTKUdygrrDs8RmYYqCjP3Hye/"){
        OWNER = msg.sender;
        price = _price;

        for(uint i; i < users.length;) {
            allowedDiscount[users[i]] = 1;
            unchecked{++i;}
        }
    }

    modifier onlyOwner() {
        require(msg.sender == OWNER, "UNAUTHORIZED");
        _;
    }

    function uri(uint256 id) public view override returns (string memory) {
        require(exists(id), "INCORRECT_ID");
        return
            string(
                abi.encodePacked(super.uri(id), Strings.toString(id), ".json")
            );
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }
    
    function mint(uint256 id, uint256 amount) external payable {
        require(totalSupply(id) + amount < CAP, "CAP_EXCEEDED");
        require(id < 2, "ID_LIMIT");

        if(allowedDiscount[msg.sender] != 0 ) {
            require(msg.value == (amount * (price / 2)), "INCREASE_VALUE");
            _mint(msg.sender, id, amount, "");
        }
        else {
            require(msg.value == (amount * price), "INCREASE_VALUE");
            _mint(msg.sender, id, amount, "");
        }
    }
   
    function withdraw() external onlyOwner {
        (bool success, ) = (msg.sender).call{value: address(this).balance}("");
        require(success, "WITHDRAW_FAILED");
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
