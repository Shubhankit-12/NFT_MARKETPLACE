const Button = ({ onClick, label, type = "button" }) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
};

export default Button;
