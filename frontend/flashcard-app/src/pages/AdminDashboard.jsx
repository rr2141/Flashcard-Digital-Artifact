import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid'; // Importing a trash icon for better UI

// Only admins can access this page
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetches the dashboard data from the backend API using the token
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');

      try {
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
          alert(data.error || 'Error fetching dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        alert('An unexpected error occurred while fetching dashboard data.');
      }
    };

    // Fetches the users from the backend API using the token
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch('http://localhost:3000/api/admins/', { // Updated endpoint
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        
        if (response.ok) {
          setUsers(data);  
        } else {
          alert(data.error || 'Error fetching users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        alert('An unexpected error occurred while fetching users.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchUsers();
  }, []);

  // Admin can delete user 
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return; // Confirmation prompt

    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/admins/delete/${userId}`, { // Updated endpoint
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        alert('User deleted successfully.');
      } else {
        const errorData = await response.json();
        alert(`Error deleting user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An unexpected error occurred while deleting the user.');
    }
  };

  // Tailwind Css
  return (
    <div className="min-h-screen bg-purple-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      
      {dashboardData ? (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl mb-8">
          <h3 className="text-xl font-semibold mb-4">Welcome, Admin!</h3>
          <p className="mb-2">Here is the data for the admin dashboard:</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}

      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">All Users</h3>
        
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <li className="py-4 text-center text-gray-500">No users found.</li>
            ) : (
              users.map(user => (
                <li key={user.id} className="flex justify-between items-center py-4">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">ID: {user.id}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300 transition"
                  >
                    <TrashIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;