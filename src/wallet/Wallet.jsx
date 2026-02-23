import { useState } from "react";
import connectWallet from "../utils/ConnectWallet";
import Web3Context from "../context/Web3Context";
import Button from "../Button/button";
import handleAccountChanged from "../utils/handleAccountsChanged";
import handleChainChanged from "../utils/handleChainChanged";

const Wallet = ({ children }) => {
  const [state, setState] = useState({
    provider: null,
    account: null,
    nftContract: null,
    chainId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleWallet = async () => {
    try {
      setIsLoading(true);

      const {
        provider,
        selectedAccount,
        nftContract,
        chainId,
      } = await connectWallet();

      setState({
        provider,
        account: selectedAccount,
        nftContract,
        chainId,
      });

      const onAccountsChanged = handleAccountChanged(setState);
      const onChainChanged = handleChainChanged(setState);

      window.ethereum.on("accountsChanged", onAccountsChanged);
      window.ethereum.on("chainChanged", onChainChanged);

      onAccountsChanged([selectedAccount]);
      onChainChanged(`0x${chainId.toString(16)}`);

      window.addEventListener("beforeunload", () => {
        window.ethereum.removeListener("accountsChanged", onAccountsChanged);
        window.ethereum.removeListener("chainChanged", onChainChanged);
      });
    } catch (error) {
      console.log("Wallet connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Web3Context.Provider value={state}>
        {/* Connect Wallet Button - Fixed at top right */}
        {!state.account && (
          <div className="fixed top-6 right-6 z-50">
            <Button 
              onClick={handleWallet} 
              label={isLoading ? "Connecting..." : "Connect Wallet"}
            />
          </div>
        )}

        {/* Connected Wallet Status - Fixed at top right */}
        {state.account && (
          <div className="fixed top-6 right-6 z-50 bg-green-500/20 backdrop-blur-lg border-2 border-green-400/60 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">
                {state.account.slice(0, 6)}...{state.account.slice(-4)}
              </span>
            </div>
          </div>
        )}

        {children}
      </Web3Context.Provider>
    </div>
  );
};

export default Wallet;