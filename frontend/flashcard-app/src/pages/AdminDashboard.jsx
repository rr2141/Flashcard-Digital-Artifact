import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      
      // Fetches the dashboard data from the backend API using the token
      const response = await fetch('http://localhost:3000/api/admins/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setDashboardData(data);  
      } else {
        alert('Error fetching dashboard data');
      }
    };

    // Fetches the users from the backend API using the token
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      
      
      const response = await fetch('http://localhost:3000/api/admins/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);  
      } else {
        alert('Error fetching users');
      }
      setLoading(false);
    };

    fetchDashboardData();
    fetchUsers();
  }, []);

  // Admin can delete user 
  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`http://localhost:3000/api/admins/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setUsers(users.filter(user => user.id !== userId));
    } else {
      alert('Error deleting user');
    }
  };

  return (
    <div className="min-h-screen bg-purple-100 flex flex-col justify-center items-center">
      <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
      {dashboardData ? (
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md mb-8">
          <h3 className="text-xl font-semibold">Welcome, Admin!</h3>
          <p className="mt-4">Here is the data for the admin dashboard:</p>
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">All Users</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <ul>
            {users.map(user => (
              <li key={user.id} className="flex justify-between items-center mb-2">
                <span>{user.name}</span>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;