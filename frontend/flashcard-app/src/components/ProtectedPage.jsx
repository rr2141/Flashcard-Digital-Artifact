import React, { useEffect, useState } from 'react';

const ProtectedPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');  // Get token from localStorage

      if (!token) {
        setError('No token found, please log in');
        return;
      }

      try {
        // Make API call to protected route
        const response = await fetch('http://localhost:3000/api/protected-route', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,  // Add token to Authorization header
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(`Error: ${errorData.error || 'Something went wrong'}`);
        } else {
          const data = await response.json();
          setData(data);
        }
      } catch (error) {
        setError('Error fetching protected data');
        console.error('Fetch error:', error);
      }
    };

    fetchProtectedData();
  }, []);  

  return (
    <div className="protected-page">
      {error && <p className="error-message">{error}</p>}
      {data ? (
        <div className="data">
          <h1>Protected Data</h1>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading protected data...</p>
      )}
    </div>
  );
};

export default ProtectedPage;
