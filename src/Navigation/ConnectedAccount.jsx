
// import { useContext } from "react";
// import Web3context from "../../context/Web3Context";

// const ConnectedAccount = () => {
//   const { account } = useContext(Web3context);
//   // console.log(account, "selectedAccount");
//   return <p>Connected Account : {account}</p>;
// };

// export default ConnectedAccount;
import { useContext } from "react";
import Web3context from "../context/Web3Context";

const ConnectedAccount = () => {
  const { account } = useContext(Web3context);

  return (
    <div className="flex flex-col items-start p-4 bg-white rounded-lg shadow">
      <p className="text-gray-700 font-medium mb-1">Connected Account:</p>
      <span className="text-blue-600 font-semibold break-all">{account}</span>
    </div>
  );
};

export default ConnectedAccount;
