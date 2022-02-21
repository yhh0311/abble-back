// Klaytn IDE uses solidity 0.4.24, 0.5.6 versions.
pragma solidity >=0.4.24 <=0.5.6;


contract IKIP17Receiver {
    function onKIP17Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4);
}

contract NFTManager {
    string public name = "KlayLion";
    string public symbol = "KL";

    mapping(uint256 => address) public tokenOwner;
    mapping(uint256 => string) public tokenURIs;
    mapping(uint256 => string) public tokenPosXs;
    mapping(uint256 => string) public tokenPosYs;

    mapping(address => uint256[]) private _ownedTokens; //보유 토큰 리스트
    bytes4 private constant _KIP17_RECEIVED = 0x6745782b;

    function mintWithTokenURI(
        address to,
        uint256 tokenId,
        string memory tokenURI
    ) public returns (bool) {
        tokenOwner[tokenId] = to;
        tokenURIs[tokenId] = tokenURI;

        _ownedTokens[to].push(tokenId);

        return true;
    }

    function mintWithPositionAndURI(
        address to,
        uint256 tokenId,
        string memory tokenPosX,
        string memory tokenPosY,
        string memory tokenURI
    ) public returns (bool) {
        tokenOwner[tokenId] = to;
        tokenURIs[tokenId] = tokenURI;
        tokenPosXs[tokenId] = tokenPosX;
        tokenPosYs[tokenId] = tokenPosY;

        _ownedTokens[to].push(tokenId);

        return true;
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public {
        require(from == msg.sender, "from != msg.sender");
        require(
            from == tokenOwner[tokenId],
            "you are not the owner of the token"
        );
        
        _removeTokenFromList(from, tokenId);
        _ownedTokens[to].push(tokenId);
        
        tokenOwner[tokenId] = to;
        
        require(
            _checkOnKIP17Received(from, to, tokenId, _data),
            "KIP17: transfer to non KIP17Receiver implementer"
        );
    }

    function _removeTokenFromList(address from, uint256 tokenId) private {
        uint256 lastTokenIdex = _ownedTokens[from].length - 1;
        for (uint256 i = 0; i < _ownedTokens[from].length; i++) {
            if (tokenId == _ownedTokens[from][i]) {
                _ownedTokens[from][i] = _ownedTokens[from][lastTokenIdex];
                _ownedTokens[from][lastTokenIdex] = tokenId;
                break;
            }
        }
        
        _ownedTokens[from].length--;
    }

    function ownedTokens(address owner) public view returns (uint256[] memory) {
        return _ownedTokens[owner];
    }

    function setTokenUri(uint256 id, string memory uri) public {
        tokenURIs[id] = uri;
    }

    function _checkOnKIP17Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal returns (bool) {
        bool success;
        bytes memory returndata;

        if (!isContract(to)) {
            return true;
        }

        (success, returndata) = to.call(
            abi.encodeWithSelector(
                _KIP17_RECEIVED,
                msg.sender,
                from,
                tokenId,
                _data
            )
        );
        if (
            returndata.length != 0 &&
            abi.decode(returndata, (bytes4)) == _KIP17_RECEIVED
        ) {
            return true;
        }

        return false;
    }

    function isContract(address account) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }
}


/* (수정) Market 부분만 사용 (위에 부분은 KIP17Token으로 대체) */
contract NFTMarket {
    mapping(uint256 => address) public seller;

    function buyNFT(uint256 tokenId, address NFT)
        public
        payable
        returns (bool)
    {
        address payable receiver = address(uint160(seller[tokenId]));

        receiver.transfer(10**16);  // (수정) 구매금액 정해지면 대체

        NFTManager(NFT).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId,
            "0x00"
        );

        return true;
    }

    /* (수정) SafeTransferFrom에서 호출 */
    function onKIP17Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4) {
        seller[tokenId] = from;

        return
            bytes4(keccak256("onKIP17Received(address,address,uint256,bytes)"));
    }
}