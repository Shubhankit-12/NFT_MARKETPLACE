import { useContext, useEffect, useState } from "react";
import web3Context from "../context/web3Context";
import { ethers } from "ethers";

const ShowNft = () => {
  const { provider, account, nftContract } = useContext(web3Context);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState(null);

  // =============================
  // Fetch All Listed NFTs
  // =============================
  const fetchListings = async () => {
    if (!provider || !account || !nftContract) return;

    try {
      setLoading(true);
      setError(null);

      const result = await nftContract.getAllListings();
      const [tokenIds, sellers, prices] = result;

      const items = [];

      for (let i = 0; i < tokenIds.length; i++) {
        if (prices[i].toString() === "0") continue;

        const tokenId = tokenIds[i];
        const seller = sellers[i];
        const price = prices[i];

        let metadata = {
          name: `NFT #${tokenId}`,
          description: "No description available",
          image: "",
        };

        try {
          const tokenURI = await nftContract.tokenURI(tokenId);
          const metadataURL = tokenURI.replace(
            "ipfs://",
            "https://gateway.pinata.cloud/ipfs/"
          );

          const res = await fetch(metadataURL);
          metadata = await res.json();

          if (metadata.image?.startsWith("ipfs://")) {
            metadata.image = metadata.image.replace(
              "ipfs://",
              "https://gateway.pinata.cloud/ipfs/"
            );
          }
        } catch {
          console.log("Metadata fetch failed:", tokenId.toString());
        }

        items.push({
          tokenId: tokenId.toString(),
          seller,
          price: ethers.formatEther(price),
          rawPrice: price, // IMPORTANT: Keep original
          metadata,
        });
      }

      setListings(items);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [provider, account, nftContract]);

  // =============================
  // BUY NFT FUNCTION (FIXED)
  // =============================
  const handleBuyNFT = async (tokenId, rawPrice) => {
    if (!provider || !account || !nftContract) {
      alert("Wallet not connected");
      return;
    }

    try {
      setBuyingId(tokenId);

      const signer = await provider.getSigner();
      const contractWithSigner = nftContract.connect(signer);

      const tx = await contractWithSigner.buyNFT(tokenId, {
        value: rawPrice, // ❗ DO NOT parseEther again
      });

      await tx.wait();

      alert(`✅ Successfully bought NFT #${tokenId}!`);

      fetchListings(); // Refresh after purchase
    } catch (error) {
      console.error("❌ Error buying NFT:", error);
      alert("Failed to buy NFT. Check console.");
    } finally {
      setBuyingId(null);
    }
  };

  if (!provider || !account) {
    return (
      <div className="text-center text-white py-10">
        Connect wallet to view NFTs
      </div>
    );
  }

  if (loading) {
    return <div className="text-center text-white py-10">Loading NFTs...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 py-10">Error: {error}</div>;
  }

  return (
    <div className="w-full px-6 py-10">
      <h1 className="text-4xl font-bold text-white text-center mb-12">
        Listed NFTs
      </h1>

      {listings.length === 0 ? (
        <div className="text-center text-white/70">No NFTs listed.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((nft) => (
            <div
              key={nft.tokenId}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:scale-105 transition"
            >
              <div className="h-64 bg-slate-800">
                {nft.metadata.image ? (
                  <img
                    src={nft.metadata.image}
                    alt={nft.metadata.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2 truncate">
                  {nft.metadata.name}
                </h3>

                <p className="text-white/70 mb-4 line-clamp-2">
                  {nft.metadata.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Token ID</span>
                    <span>{nft.tokenId}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Price</span>
                    <span className="text-green-400 font-bold">
                      {nft.price} ETH
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Seller</span>
                    <span className="font-mono">
                      {nft.seller.slice(0, 6)}...
                      {nft.seller.slice(-4)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleBuyNFT(nft.tokenId, nft.rawPrice)
                  }
                  disabled={buyingId === nft.tokenId}
                  className={`w-full mt-6 py-3 rounded-lg font-bold transition ${
                    buyingId === nft.tokenId
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {buyingId === nft.tokenId
                    ? "Processing..."
                    : "Buy NFT"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowNft;
