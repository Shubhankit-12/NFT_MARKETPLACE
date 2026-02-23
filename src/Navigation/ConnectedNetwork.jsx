// import { useContext } from "react";
// import Web3context from "../../context/Web3Context";

// const ConnectedNetwork = () => {
//   const { chainId } = useContext(Web3context);
//   // console.log(chainId, "selectedAccount");
//   if (chainId === 11155111) return <div>ConnectedNetwork: sepolia</div>;
// };

// export default ConnectedNetwork;
import { useContext } from "react";
import Web3context from "../context/Web3Context";

const ConnectedNetwork = () => {
  const { chainId } = useContext(Web3context);

  if (chainId === 11155111) {
    return (
      <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow">
        <p className="text-gray-700 font-medium mb-1">Connected Network:</p>
        <span className="text-blue-600 font-semibold">Sepolia</span>
      </div>
    );
  }

  return null;
};

export default ConnectedNetwork;
