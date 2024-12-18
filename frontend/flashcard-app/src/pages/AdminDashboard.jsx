import React, { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/20/solid'; 

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [setLimit, setSetLimit] = useState(20); 
  const [newSetLimit, setNewSetLimit] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLimit, setLoadingLimit] = useState(true);
  const [updatingLimit, setUpdatingLimit] = useState(false);

  // Fetches the dashboard data for the admin
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

    fetchDashboardData();
  }, []);

  // Fetches all the users in the database
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:3000/api/admins/', {
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
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetches the set limit for flashcard sets created per day
  useEffect(() => {
    const fetchSetLimit = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch('http://localhost:3000/api/admins/set-limit', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setSetLimit(data.dailyLimit);
        } else {
          alert(data.error || 'Error fetching set limit');
        }
      } catch (error) {
        console.error('Error fetching set limit:', error);
        alert('An unexpected error occurred while fetching set limit.');
      } finally {
        setLoadingLimit(false);
      }
    };

    fetchSetLimit();
  }, []);

  // Admin can delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return; // Confirmation prompt

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3000/api/admins/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
        alert('User deleted successfully.');
      } else {
        alert(data.error || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An unexpected error occurred while deleting the user.');
    }
  };

  // Admin can set the limit of flashcard sets created per day
  // 20 is the default limit
  const handleUpdateSetLimit = async (e) => {
    e.preventDefault();

    const limit = parseInt(newSetLimit, 10);

    if (isNaN(limit) || limit < 0) {
      alert('Please enter a valid non-negative number for the limit.');
      return;
    }

    setUpdatingLimit(true);

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3000/api/admins/set-limit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ dailyLimit: limit }), 
      });

      const data = await response.json();

      if (response.ok) {
        setSetLimit(data.dailyLimit);
        setNewSetLimit('');
        alert('Set limit updated successfully.');
      } else {
        alert(data.error || 'Error updating set limit');
      }
    } catch (error) {
      console.error('Error updating set limit:', error);
      alert('An unexpected error occurred while updating set limit.');
    } finally {
      setUpdatingLimit(false);
    }
  };

  // Tailwind CSS
  return (
    <div className="min-h-screen bg-purple-100 flex flex-col items-center p-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {/* Admin Dashboard Data */}
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

      {/* Daily Set Limit Management */}
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl mb-8">
        <h3 className="text-xl font-semibold mb-4">Manage Flashcard Set Limit</h3>
        {loadingLimit ? (
          <p>Loading set limit...</p>
        ) : (
          <div>
            <p className="mb-4">
              <strong>Current Daily Flashcard Set Limit:</strong> {setLimit}
            </p>
            <form onSubmit={handleUpdateSetLimit} className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                placeholder="New Limit"
                value={newSetLimit}
                onChange={(e) => setNewSetLimit(e.target.value)}
                className="px-4 py-2 border rounded-md w-full"
                required
              />
              <button
                type="submit"
                disabled={updatingLimit}
                className={`px-4 py-2 rounded-md text-white ${
                  updatingLimit ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {updatingLimit ? 'Updating...' : 'Update Limit'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Shows all Users */}
      <div className="bg-white p-6 rounded shadow-md w-full max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">All Users</h3>

        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <li className="py-4 text-center text-gray-500">No users found.</li>
            ) : (
              users.map((user) => (
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