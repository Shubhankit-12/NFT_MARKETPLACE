const handleAccountChanged = (setState) => (accounts) => {
  const account = accounts?.[0] || null;

  console.log("account changed:", account);

  setState((prevState) => ({
    ...prevState,
    account,
  }));
};

export default handleAccountChanged;
