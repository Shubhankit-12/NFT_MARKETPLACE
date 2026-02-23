// import ConnectedAccount from "./ConnectedAccount";
// import ConnectedNetwork from "./ConnectedNetwork";

// const Navigation = () => {
//   return (
//     <nav>
//       <ConnectedAccount />
//       <ConnectedNetwork/>
//     </nav>
//   );
// };

// export default Navigation;
import ConnectedAccount from "./ConnectedAccount";
import ConnectedNetwork from "./ConnectedNetwork";

const Navigation = () => {
  return (
    <nav className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-4 p-4 bg-gray-50 shadow-md rounded-b-lg">
      <ConnectedAccount />
      <ConnectedNetwork />
    </nav>
  );
};

export default Navigation;
