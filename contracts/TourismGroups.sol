// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "./Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract TourismGroups is ERC721, ERC721Burnable, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _idCounter;

    uint256 public maxSupply;

    struct TokenDetails {
        uint256 tokenId;
        uint256 expirationDate;
        uint256 startDate;
        string description;
    }

    mapping(uint256 => TokenDetails) private _tokenDetails;

    constructor(uint256 _maxSuply) ERC721("TourismGroups", "TGRP") {
        maxSupply = _maxSuply;
    }

    function burnExpiredToken(uint256 tokenId) external {
        require(_exists(tokenId), "Token does not exist");
        require(block.timestamp >= _tokenDetails[tokenId].expirationDate, "Token has not expired yet");

        _burn(tokenId);
        delete _tokenDetails[tokenId];
    }

    function burn(uint256 tokenId) public override {
        require(_exists(tokenId), "Token does not exist");
        require(
            _msgSender() == ownerOf(tokenId) || _msgSender() == owner(),
            "Unauthorized to burn"
        );
        _burn(tokenId);
        delete _tokenDetails[tokenId];
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(uint256 _expirationDate, uint256 _startDate, string memory description) public{
        uint256 tokenId = _idCounter.current();
        require(tokenId < maxSupply, "Maximum supply reached");
        _safeMint(msg.sender, tokenId);
        _idCounter.increment();
        _tokenDetails[tokenId] = TokenDetails(tokenId, _expirationDate, _startDate, description);
    }

    function getExpirationDate(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenDetails[tokenId].expirationDate;
    }

    function tokenURI(uint256 tokenId)
        public 
        view 
        override 
        returns (string memory)
    {
        // 
        require(_exists(tokenId) 
            ,"ERC721 Metadata: URI query for nonexistend token"
        );

         string memory jsonURI = Base64.encode(
            abi.encodePacked(
                '{"name": "ExpirableNFT #',
                tokenId.toString(),
                '", "description": "',
                _tokenDetails[tokenId].description,
                '", "startDate": ',
                _tokenDetails[tokenId].startDate.toString(),
                ', "image":"https://www.vivocruceros.com/wp-content/uploads/2018/04/logo_msc_cruceros.png"}'
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", jsonURI));

    }

    // Oberride required
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}