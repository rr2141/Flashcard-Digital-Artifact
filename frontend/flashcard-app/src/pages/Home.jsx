import React, { useState, useEffect } from 'react';
import SignIn from '../components/signin';

const Home = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Checks if there's a token in localStorage when the component first loads
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <>

      {token ? (
        <div>
          <h1>Welcome Back!</h1>
        
        </div>
      ) : (
        <SignIn setToken={setToken} />
      )}
    </>
  );
};

export default Home;