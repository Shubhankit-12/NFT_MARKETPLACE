import { ethers } from "ethers";
import ERC721Abi from "../contracts/ERC721Abi.json";

const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error("Metamask is not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts", []);

    const chainIDHex = await window.ethereum.request({
      method: "eth_chainId",
    });

    const chainId = parseInt(chainIDHex, 16);

    const selectedAccount = accounts[0];
    if (!selectedAccount) {
      throw new Error("No Ethereum accounts available");
    }

    const signer = await provider.getSigner();

    const Contract = new ethers.Contract(
      "0x782D7FcC253685a8dE8B03b9b71c282cC91a9f7f",
      ERC721Abi,
      signer,
    );
    console.log(Contract);

    return {
      provider,
      selectedAccount,
      nftContract: Contract,
      chainId,
    };
  } catch (error) {
    console.error("connectWallet error:", error);
    throw error;
  }
};

export default connectWallet;
