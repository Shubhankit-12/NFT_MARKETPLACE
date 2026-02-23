import { useContext, useEffect, useState } from "react";
import Web3Context from "../context/Web3Context";
import { ethers } from "ethers";

const ShowNft = () => {
  const { provider, account, nftContract, chainId } = useContext(Web3Context);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buyingTokenId, setBuyingTokenId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!provider || !account || !nftContract || !chainId) return;

      try {
        setLoading(true);
        setError(null);

        const result = await nftContract.getAllListings();
        const [tokenIds, sellers, prices] = result;

        const validListings = [];

        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i];
          const seller = sellers[i];
          const price = prices[i];

          if (price.toString() === "0") continue;

          try {
            const tokenURI = await nftContract.tokenURI(tokenId);

            const metadataURL = tokenURI.replace(
              "ipfs://",
              "https://gateway.pinata.cloud/ipfs/",
            );

            let metadata = {};
            try {
              const res = await fetch(metadataURL);
              metadata = await res.json();
            } catch {
              metadata = {
                name: `NFT #${tokenId}`,
                description: "Metadata not available",
                image: "",
              };
            }

            validListings.push({
              tokenId: tokenId.toString(),
              price: ethers.formatEther(price),
              seller,
              metadata,
            });
          } catch (err) {
            console.error("Token error:", err);
          }
        }

        setListings(validListings);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [provider, account, nftContract, chainId]);

  // =========================
  // BUY FUNCTION
  // =========================
  const handleBuy = async (tokenId, price) => {
    try {
      if (!provider || !nftContract) {
        alert("Wallet not connected");
        return;
      }

      setBuyingTokenId(tokenId);

      const signer = await provider.getSigner();
      const contractWithSigner = nftContract.connect(signer);

      const tx = await contractWithSigner.buyNFT(tokenId, {
        value: ethers.parseEther(price),
      });

      await tx.wait();

      alert("NFT Purchased Successfully!");

      // Remove purchased NFT from UI
      setListings((prev) => prev.filter((item) => item.tokenId !== tokenId));
    } catch (err) {
      console.error("Buy error:", err);
      alert(err.reason || err.message);
    } finally {
      setBuyingTokenId(null);
    }
  };

  if (!provider || !account) return null;

  if (loading) {
    return (
      <div className="text-center py-12 text-white text-xl">
        Loading NFTs...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 text-center py-12">Error: {error}</div>;
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-white text-center mb-12">
        Listed NFTs
      </h1>

      {listings.length === 0 ? (
        <p className="text-center text-white text-xl">No NFTs listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((nft) => (
            <div
              key={nft.tokenId}
              className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <div className="h-64 bg-slate-800 mb-4 rounded-lg overflow-hidden">
                {nft.metadata.image ? (
                  <img
                    src={nft.metadata.image}
                    alt={nft.metadata.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    No Image
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                {nft.metadata.name || `NFT #${nft.tokenId}`}
              </h3>

              <p className="text-white/70 mb-4">{nft.metadata.description}</p>

              <div className="flex justify-between text-white mb-4">
                <span>Price:</span>
                <span className="text-green-400 font-bold">
                  {nft.price} ETH
                </span>
              </div>

              <button
                onClick={() => handleBuy(nft.tokenId, nft.price)}
                disabled={buyingTokenId === nft.tokenId}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
              >
                {buyingTokenId === nft.tokenId ? "Processing..." : "Buy Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowNft;
