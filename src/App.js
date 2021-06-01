import React, { Component } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { 
  	bid: 0, 
  	web3: null, 
  	accounts: null, 
  	contract: null,
  	highestbid: 0,
  	highestbidder: "",
  	can_withdraw: null,
  	balance: null,
  	input: "" 
  	};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = AuctionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        AuctionContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      const high_bid = await instance.methods.highestBid().call();
      const high_bidder = await instance.methods.highestBidder().call();
      const bal = await instance.methods.userBalances(accounts[0]).call();

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({highestbid: high_bid, highestbidder: high_bidder, balance: bal })
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runBid = async () => {
    const { accounts, contract, web3 } = this.state;

    const val = await web3.utils.toWei(this.state.input, 'ether');
    
    
    await contract.methods.bid().send({ from: accounts[0], value: val });

    //const response_bid = await contract.methods.highestBid().call();
    //const response_bidder = await contract.methods.highestBidder().call;

    // Update state with the result.
    this.setState({ highestbid: val, highestbidder: accounts[0], balance: val });
  };
  
  runWithdraw = async () => {
  	const { accounts, contract } = this.state;
  	
  	await contract.methods.withdraw().send({ from: accounts[0] });
  	
  	//const response_bid = await contract.methods.highestBid().call();
    //const response_bidder = await contract.methods.highestBidder().call;
    this.setState({ balance: 0 });
    //this.setState({ highestbid: response_bid, highestbidder: response_bidder });
  }
  
  getValue = (event) => {
    this.setState({input: event.target.value}, () => {
      console.log(this.state.input)
    });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
      
        <h1><u>Auction</u></h1>
        <h2>Lets begin the Auction!</h2>
	
	<label for="bid">Enter bid: </label>
	<input type="text" id="bid name="bid onChange ={this.getValue} />&nbsp;&nbsp;

	<button onClick = {this.runBid}>Bid</button>
	
	<p> Your bid is: {this.state.balance} wei </p>
        
        <hr></hr>

		<div>
	        <p> The highest bid is: {this.state.highestbid} wei </p>
			<p> The highest bidder is: {this.state.highestbidder} </p>
		</div>
		
		<hr></hr>
		
        <div>The one with the lowest bid can withdraw: &nbsp;<button onClick = {this.runwithdraw}>Withdraw</button></div>
        
      </div>
    );
  }
}

export default App;
