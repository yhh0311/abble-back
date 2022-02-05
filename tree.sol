pragma solidity >=0.7.0 <0.9.0;

contract TreeNFT {
    struct treeInfo {
        uint256 x;
        uint256 y;
        uint256 z;
        address holder;
        string url;
    }

    treeInfo[] private trees;

    function registerTree(uint256 _x, uint256 _y, uint256 _z, address _holder, string memory _url) public {
        treeInfo memory tree;
        tree.x = _x;
        tree.y = _y;
        tree.z = _z;
        tree.holder = _holder;
        tree.url = _url;
        trees.push(tree);
    }

    function getTrees() public view returns (treeInfo[] memory) {
        return trees;
    }
}