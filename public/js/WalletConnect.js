class WalletClass {
  // Web3modal instance
  web3Modal;

  // Chosen wallet provider given by the dialog window
  provider;

  // Address of the selected account
  selectedAccount;

  // The button attaches a function to this variable
  changeButton;

  web3;

  constructor() {
    this.Web3Modal = window.Web3Modal.default;
    this.WalletConnectProvider = window.WalletConnectProvider.default;

    const providerOptions = {
      walletconnect: {
        package: this.WalletConnectProvider,
        options: {
          infuraId: "9aa3d95b3bc440fa88ea12eaa4456161",
        },
      },
    };

    this.web3Modal = new this.Web3Modal({
      //network: "matic",
      cacheProvider: true, // optional
      providerOptions, // required
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    });

    // check if web wallet is already connected.
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum);

    //   this.web3.eth.getAccounts((accounta, accountb) => {
    //     //if(accounta){onConnect();}
    //     //else
    //     if (accountb[0]) {
    //       this.onConnect();
    //     } // <<-- this is what works for me on Firefox Metamask
    //   });
    }
  }

  connected = () => {
    this.web3.eth.getAccounts().then((accounts) => {
      console.log(accounts);
      this.selectedAccount = accounts[0];
   
      this.changeButton(obscureAddress(this.selectedAccount));
    });
  };

  disconnected = () => {
    this.changeButton("disconnected");
  };

  fetchAccountData = async () => {
    // Get a Web3 instance for the wallet
    this.web3 = new Web3(this.provider);

    // Get connected chain id from Ethereum node
    const chainId = await this.web3.eth.getChainId();

    // Get list of accounts of the connected wallet
    const accounts = await this.web3.eth.getAccounts();

 
    // MetaMask does not give you all accounts, only the selected account
    this.selectedAccount = accounts[0];

    if (!accounts[0]) {
      await this.onDisconnect();
      return;
    } //if user disconnected wallet

    this.connected();
  };

  updateButton = async () => {
    if (this.selectedAccount) {
      this.connected();
    } else {
      this.changeButton("disconnected");
    }
  };

  onConnect = async () => {
    try {
      console.log("tries to connect");
      this.provider = await this.web3Modal.connect();
      console.log("finished trying");
    } catch (e) {
      console.log("Could not get a wallet connection", e);
      return;
    }

    // Subscribe to accounts change
    this.provider.on("accountsChanged", (accounts) => {
      console.log("event: accountsChanged");
      this.fetchAccountData();
    });

    // Subscribe to chainId change
    this.provider.on("chainChanged", (chainId) => {
      console.log("event: chainChanged");
      this.fetchAccountData();
    });

    this.fetchAccountData();
    //console.log(' this.updateButton();');
    //await this.updateButton();
  };

  Disconnect = async () => {
    if (this.provider.disconnect) {
      await this.provider.disconnect();

      await this.Disconnect();
    } else {
      alert("The disconnection button is located in the wallet!");
    }
  };

  onDisconnect = async () => {
    // If the cached provider is not cleared,
    // WalletConnect will default to the existing session
    // and does not allow to re-scan the QR code with a new wallet.
    // Depending on your use case you may want or want not his behavir.
    await this.web3Modal.clearCachedProvider();

    //provider = null; //if set to null, we get an error when reconnecting the wallet

    this.selectedAccount = null;

    this.changeButton("disconnected");
  };
}
