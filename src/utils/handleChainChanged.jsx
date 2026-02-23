const handleChainChanged = (setState) => (chainIdHex) => {
  const chainId = parseInt(chainIdHex, 16);

  console.log("chain changed:", chainId);

  setState((prevState) => ({
    ...prevState,
    chainId,
  }));
};

export default handleChainChanged;
