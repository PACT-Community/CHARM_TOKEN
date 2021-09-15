const CHARMToken = artifacts.require('CHARMToken');
module.exports = function(deployer, network, accounts) {
  if (deployer.network === 'test' && deployer.network === 'development') {
    return;
  }
  deployer.deploy(CHARMToken);
};




