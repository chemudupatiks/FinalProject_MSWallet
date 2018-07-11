var MultiSigWalletDapp = artifacts.require("./MultiSigWalletDapp.sol");

module.exports = function(deployer) {
  deployer.deploy(MultiSigWalletDapp);
};
