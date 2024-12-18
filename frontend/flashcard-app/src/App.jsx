// App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navigation from './components/navigation';
import Home from './pages/Home';
import Flashcard from './pages/Flashcard';
import CreateFlashcards from './pages/CreateFlashcards';
import MyFlashcards from './pages/MyFlashcards';
import Collectionpage from './pages/Collection';
import SignIn from './components/signin';
import SignUp from './components/signup';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

// Component to handle redirection after login
const AuthRedirect = ({ token, isAdmin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      if (isAdmin) {
        navigate('/admin-dashboard');
      } else {
        navigate('/my-flashcards');
      }
    }
  }, [token, isAdmin, navigate]);

  return null;
};

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(null); 
  const [username, setUsername] = useState('User');
  const [loading, setLoading] = useState(true);


  const decodeToken = (storedToken) => {
    try {
      const decoded = JSON.parse(atob(storedToken.split('.')[1]));
      setIsAdmin(decoded.admin);
      setUsername(decoded.username || 'User');
    } catch (error) {
      console.error("Error decoding token: ", error);
      setIsAdmin(false);
      setUsername('User');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      decodeToken(storedToken);
    } else {
      setIsAdmin(false);
      setUsername('User');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      decodeToken(token);
      setLoading(false);
    } else {
      setIsAdmin(false);
      setUsername('User');
    }
  }, [token]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setIsAdmin(false);
    setUsername('User');
  };

  if (loading || isAdmin === null) {
    return <div>Loading...</div>; 
  }

  return (
    <Router>
      <Navigation username={username} onLogout={handleLogout} isAdmin={isAdmin} />
      {/* Handle redirection after login */}
      <AuthRedirect token={token} isAdmin={isAdmin} />
      <div className="p-4">
        <Routes>
          {/* Route for Home page */}
          <Route path="/" element={token ? <Home /> : <SignIn setToken={setToken} />} />

          {/* Routes for Flashcards and other pages, only accessible if logged in */}
          <Route path="/create" element={token ? <CreateFlashcards /> : <SignIn setToken={setToken} />} />
          <Route path="/my-flashcards" element={token ? <MyFlashcards /> : <SignIn setToken={setToken} />} />
          <Route path="/collection" element={token ? <Collectionpage /> : <SignIn setToken={setToken} />} />
          <Route path="/flashcard" element={token ? <Flashcard set={{ id: 1, name: 'Test Set' }} onBack={() => {}} /> : <SignIn setToken={setToken} />} />
          <Route path="/settings" element={token ? <Settings /> : <SignIn setToken={setToken} />} />

          {/* Admin Dashboard only accessible if the user is an admin */}
          <Route 
            path="/admin-dashboard" 
            element={token && isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} 
          />

          {/* Route for SignUp page */}
          <Route path="/signup" element={<SignUp />} />

          {/* Catch-all Route for Undefined Paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;