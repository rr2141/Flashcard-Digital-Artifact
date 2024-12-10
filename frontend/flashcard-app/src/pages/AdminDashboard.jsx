import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      
      // Fetch the data from the backend API using the token
      const response = await fetch('http://localhost:3000/api/admins/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setDashboardData(data);  // Store the fetched data
      } else {
        alert('Error fetching dashboard data');
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
      {dashboardData ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h3 className="text-xl font-semibold">Welcome, Admin!</h3>
          <p className="mt-4">Here is the data for the admin dashboard:</p>
          {/* Render dashboard data here */}
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}
    </div>
  );
};

export default AdminDashboard;
