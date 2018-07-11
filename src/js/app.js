
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

 init: function() {
       return App.initWeb3();
},

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 != 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.WebsocketProvider('http://gyaan.network:8545');
      // WebsocketProvider('http://gyaan.network:8545')
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

 initContract: function() {
    $.getJSON("MultiSigWalletDapp.json", function(MultiSigWalletDapp) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.MultiSigWalletDapp = TruffleContract(MultiSigWalletDapp);
      // Connect provider to interact with contract
      App.contracts.MultiSigWalletDapp.setProvider(App.web3Provider);
      return App.render();
    });
  },
 render: function() {
    var walletInstance;
    // var loader = $("#loader");
    var active = $("#Active");
    var inactive = $("#inActive");
    var contriTable = $("#contributions");
    // loader.show();
    contriTable.show();
    active.hide();
    inactive.show();
    //maybe add contributions.
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });
    // Load contract data
    App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
      walletInstance = instance;
      return walletInstance.noOfContributors();

    }).then(function(numContributors) {
      var contributorsAmounts = $("#contributorsAmounts");
      contributorsAmounts.empty();

      for (var i = 0; i < numContributors; i++) {
        walletInstance.contributors(i).then(function(address) {
          walletInstance.contributorsMap(address).then(function(amountGiven){
            var contributionTemplate = "<tr><td>" + address + "</td><td>" + amountGiven + "</td></tr>";
            candidatesResults.append(contributionTemplate);
          });
        });
      }
      return walletInstance.noOfOpenProposals();

    }).then(function(numOProposals) {
      var openProposals = $("#openProposals");
      openProposals.empty();

      for (var i = 0; i < numOProposals; i++) {
        walletInstance.openProposals(i).then(function(address) {
          walletInstance.submittedProposals(address).then(function(proposal){
            var beneficiary = address;
            var voteCount = proposal[3];
            // _signer ==|| _signer ==  || _signer ==
            walletInstance.getSignerVote("0xfA3C6a1d480A14c546F12cdBB6d1BaCBf02A1610",beneficiary).then(function(decision1){
              walletInstance.getSignerVote("0x2f47343208d8Db38A64f49d7384Ce70367FC98c0", beneficiary).then(function(decision2){
                walletInstance.getSignerVote("0x7c0e7b2418141F492653C6bF9ceD144c338Ba740", beneficiary).then(function(decision3){
                  var proposalTemplate = "<tr><th>" + beneficiary + "</th><td>" + voteCount + "</td><td>" + decision1 +  "</td><td>"+ decision2+ "</td><td>"+ decision3+ "</td></tr>";
                  openProposals.append(proposalTemplate);
                });
              });
            });
          });
        });
      }
      return walletInstance.activeForProposals();

    }).then(function(isActive){
      // loader.hide();
      contriTable.show();
      if(isActive){
        active.show();
      } else {
        inactive.show();
      }
    }).catch(function(error) {
        console.warn(error);
      });
  },
contributeMoney: function() {
    var amount = $('#inputContribution').val();
    App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
      return instance.sendTransaction({ from: App.account, value: web3.toWei(amount,"ether")});
    }).then(function(result) {
      // $("#txhash").html("Transaction successful: " + result);
      alert("transaction successful!")
    }).catch(function(err) {
      console.error(err);
    });
  },
endContri: function() {
    App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
      return instance.endContributionPeriod({ from: App.account});
    }).then(function(result) {
      $("#txhash").html("Transaction successful: " + result);
    }).catch(function(err) {
      console.error(err);
    });
  },
submitAProp: function() {
    var amount = $('#inputProposal').val();
    App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
    return instance.submitProposal(amount, { from: App.account});
   }).then(function(result) {
     $("#txhash").html("Transaction successful: " + result);
   }).catch(function(err) {
     console.error(err);
     });
   },
withdrawEth: function() {
    var amount = $('#withdrawAmount').val();
    App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
    return instance.withdraw(amount, { from: App.account});
   }).then(function(result) {
     $("#txhash").html("Transaction successful: " + result);
   }).catch(function(err) {
     console.error(err);
     });
   },
approveProp: function() {
    var beneficiary= $('#beneficiary').val();
    App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
    return instance.approve(beneficiary, { from: App.account});
   }).then(function(result) {
     $("#txhash").html("Transaction successful: " + result);
   }).catch(function(err) {
     console.error(err);
     });
   },
rejectProp: function() {
   var beneficiary= $('#beneficiary').val();
     App.contracts.MultiSigWalletDapp.deployed().then(function(instance) {
     return instance.reject(beneficiary, { from: App.account});
    }).then(function(result) {
      $("#txhash").html("Transaction successful: " + result);
    }).catch(function(err) {
      console.error(err);
    });
  }
};
$(function() {
 $(window).load(function() {
    App.init();
  });
});
