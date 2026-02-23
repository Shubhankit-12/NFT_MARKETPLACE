import IPFS from "./IPFS/IPFS";
import Navigation from "./Navigation/Navigation";
import Wallet from "./wallet/Wallet";

function App() {
  return (
    <>
      <Wallet>
        <Navigation />
        <IPFS/>
      </Wallet>
    </>
  );
}

export default App;
