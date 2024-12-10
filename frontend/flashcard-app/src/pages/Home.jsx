import React, { useState, useEffect } from 'react';
import SignIn from '../components/signin';

const Home = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Function to handle logout of user.
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); // Reset the token state
    alert('Logged out successfully');
  };

  // Checks if there's a token in localStorage when the component first loads
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      {token ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-center mb-6">Welcome back!</h2>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      ) : (
        <SignIn setToken={setToken} />
      )}
    </div>
  );
};

export default Home;
