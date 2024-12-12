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
    <>
      {/* Rest of your Home component JSX */}
      {token ? (
        <div>
          <h1>Welcome Back!</h1>
          {/* Other authenticated content */}
        </div>
      ) : (
        <SignIn setToken={setToken} />
      )}
    </>
  );
};

export default Home;