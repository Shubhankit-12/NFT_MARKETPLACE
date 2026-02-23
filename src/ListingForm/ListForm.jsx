import React, { useState } from "react";
import { useContext } from "react";
import Web3Context from "../context/Web3Context";
import { ethers } from "ethers";

const ListForm = ({ lastMintedTokenId }) => {
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const { provider, account, nftContract, chainId } = useContext(Web3Context);

  const handleListNFT = async () => {
    if (!provider || !account || !nftContract || !chainId) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!tokenId || !price) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const priceInWei = ethers.parseEther(price.toString());
      const tx = await nftContract.listing(tokenId, priceInWei);
      await tx.wait();
      alert("NFT listed successfully!");
      setTokenId("");
      setPrice("");
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Failed to list NFT: " + error.message);
    }
  };

  const handleUseLastMinted = () => {
    if (lastMintedTokenId) {
      setTokenId(lastMintedTokenId);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <div className="bg-pink-500/20 p-3 rounded-full mr-3">
          <svg
            className="w-8 h-8 text-pink-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-white">List Your NFT</h2>
      </div>

      {lastMintedTokenId && (
        <div className="mb-6 p-4 bg-green-500/20 border-2 border-green-400/60 rounded-xl">
          <p className="text-green-200 text-sm mb-3 text-center">
            ✅ Last minted Token ID:{" "}
            <span className="font-bold text-lg">{lastMintedTokenId}</span>
          </p>
          <button
            onClick={handleUseLastMinted}
            className="w-full bg-green-500/30 hover:bg-green-500/50 text-white font-semibold py-2 px-4 rounded-lg transition border border-green-400/40"
          >
            Use This Token ID
          </button>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-white text-sm font-semibold mb-2">
          Token ID:
        </label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-pink-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
          placeholder="Enter Token ID"
        />
      </div>

      <div className="mb-8">
        <label className="block text-white text-sm font-semibold mb-2">
          Price (in ETH):
        </label>
        <input
          type="number"
          step="0.001"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-pink-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
          placeholder="Enter price in ETH"
        />
      </div>

      <button
        onClick={handleListNFT}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        List NFT
      </button>
    </>
  );
};

export default ListForm;
