import { useState } from "react";
import axios from "axios";
import { useContext } from "react";
import Web3Context from "../context/Web3Context";
import ListForm from "../ListingForm/ListForm";
import ShowNft from "../ShowNft/ShowNft"; // Add this import

const IPFS = () => {
  const [nftName, setNftName] = useState("");
  const [nftMetadata, setNftMetadata] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [lastMintedTokenId, setLastMintedTokenId] = useState("");

  const { provider, account, nftContract, chainId } = useContext(Web3Context);

  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: "03ec5fc6dc04f6634880",
            pinata_secret_api_key:
              "18aeb5d9c8d241fb77f943489ebfde411f7a837a403b9abba38810550ba864b5",
          },
        });
        console.log("Image uploaded to IPFS", response.data.IpfsHash);
        const CID = response.data.IpfsHash;
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${CID}`;
        console.log(ImgHash);
        return CID;
      } catch (error) {
        console.error("Error uploading to IPFS:", error);
        return null;
      }
    }
  };

  const pinJSONTOIPFS = async (name, description, CID) => {
    try {
      const data = JSON.stringify({
        name: name,
        description: description,
        image: `https://gateway.pinata.cloud/ipfs/${CID}`,
      });
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2ZWY2YjVkYy04Njc4LTQ1M2MtYmY1ZC0wOGEzZmE5ZWI4YWYiLCJlbWFpbCI6InNodWJoYW5raXRzaHVrbGE3NDlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjAzZWM1ZmM2ZGMwNGY2NjM0ODgwIiwic2NvcGVkS2V5U2VjcmV0IjoiMThhZWI1ZDljOGQyNDFmYjc3Zjk0MzQ4OWViZmRlNDExZjdhODM3YTQwM2I5YWJiYTM4ODEwNTUwYmE4NjRiNSIsImV4cCI6MTgwMjE5MTI0N30.m6qVTgRqey8qklwByYhru9UMGmE2yr__W6StoXcl-DM`,
          },
          body: data,
        },
      );
      const resData = await res.json();
      console.log("Metadata uploaded, CID:", resData.IpfsHash);
      return resData.IpfsHash;
    } catch (error) {
      console.log(error);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();

    if (!provider || !account || !nftContract || !chainId) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!nftName || !nftMetadata || !imageFile) {
      alert("Please fill in all fields and select an image file.");
      return;
    }

    const imageURL = await uploadToIPFS(imageFile);
    if (!imageURL) {
      alert("Failed to upload image to IPFS. Please try again.");
      return;
    }

    const metadataUrl = await pinJSONTOIPFS(nftName, nftMetadata, imageURL);

    if (!metadataUrl) {
      alert("Failed to upload metadata to IPFS. Please try again.");
      return;
    }

    try {
      const tokenURI = `ipfs://${metadataUrl}`;

      const tx = await nftContract.safeMint(tokenURI);

      const receipt = await tx.wait();

      const event = receipt.logs.find((log) => {
        try {
          return nftContract.interface.parseLog(log).name === "NFTMinted";
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (event) {
        const parsedEvent = nftContract.interface.parseLog(event);
        tokenId = parsedEvent.args.tokenId.toString();
        setLastMintedTokenId(tokenId);
        console.log(tokenId, "tokenId");
      }

      alert(
        `NFT minted successfully! ${tokenId ? `Token ID: ${tokenId}` : ""}`,
      );

      setNftName("");
      setNftMetadata("");
      setImageFile(null);
    } catch (error) {
      console.error("Minting error:", error);

      if (
        error.message.includes("OwnableUnauthorizedAccount") ||
        error.message.includes("Ownable")
      ) {
        alert(
          "Error: Only the contract owner can mint NFTs. Your account is not the owner.",
        );
      } else {
        alert("Failed to mint NFT: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {" "}
        {/* Changed from max-w-4xl to max-w-7xl */}
        {/* Wallet Connection Status - Always visible at top */}
        {!provider || !account || !nftContract ? (
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            {" "}
            {/* Added max-w-4xl mx-auto */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-purple-500/20 p-4 rounded-full">
                <svg
                  className="w-12 h-12 text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Connect Your Wallet
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Please connect your wallet to start minting and listing NFTs
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-green-500/20 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-2 border-green-400/60">
            {" "}
            {/* Added max-w-4xl mx-auto */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-lg">
                  Wallet Connected
                </span>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* Only show forms when wallet is connected */}
        {provider && account && nftContract && (
          <>
            <div className="max-w-4xl mx-auto space-y-10">
              {" "}
              {/* Wrap mint and list forms */}
              {/* Mint NFT Form Box */}
              <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-1 rounded-3xl shadow-2xl">
                <form
                  onSubmit={handleMint}
                  className="w-full bg-slate-900/90 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-400/50"
                >
                  <div className="flex items-center justify-center mb-8">
                    <div className="bg-purple-500/20 p-3 rounded-full mr-3">
                      <svg
                        className="w-8 h-8 text-purple-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white">
                      Mint Your NFT
                    </h2>
                  </div>

                  <div className="mb-6">
                    <label className="block text-white text-sm font-semibold mb-2">
                      NFT Name:
                    </label>
                    <input
                      type="text"
                      value={nftName}
                      onChange={(e) => setNftName(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                      placeholder="Enter NFT name"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Description:
                    </label>
                    <textarea
                      value={nftMetadata}
                      onChange={(e) => setNftMetadata(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none h-32"
                      placeholder="Enter NFT description"
                    />
                  </div>

                  <div className="mb-8">
                    <label className="block text-white text-sm font-semibold mb-2">
                      Image File:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transform transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    Mint NFT
                  </button>
                </form>
              </div>
              {/* Divider */}
              <div className="flex items-center justify-center">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent"></div>
                <div className="mx-4 text-pink-300 font-semibold text-sm">
                  NEXT STEP
                </div>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-pink-400/50 to-transparent"></div>
              </div>
              {/* List NFT Form Box - Completely Separate */}
              <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-1 rounded-3xl shadow-2xl">
                <div className="w-full bg-slate-900/90 backdrop-blur-lg rounded-3xl p-8 border-2 border-pink-400/50">
                  <ListForm lastMintedTokenId={lastMintedTokenId} />
                </div>
              </div>
            </div>

            {/* ADD MARKETPLACE DIVIDER AND SHOWNFT HERE */}
            <div className="flex items-center justify-center mt-16">
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
              <div className="mx-4 text-blue-300 font-semibold text-sm">
                NFT MARKETPLACE
              </div>
              <div className="flex-grow h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
            </div>

            {/* ShowNft Component */}
            <ShowNft />
          </>
        )}
      </div>
    </div>
  );
};

export default IPFS;
