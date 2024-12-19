import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(null); 
  const [username, setUsername] = useState('User');
  const [loading, setLoading] = useState(true);

  const decodeToken = (storedToken) => {
    try {
      const decoded = JSON.parse(atob(storedToken.split('.')[1]));
      console.log('Decoded Token:', decoded); // Debugging line
      setIsAdmin(decoded.admin);
      setUsername(decoded.username || 'User');
    } catch (error) {
      console.error("Error decoding token:", error);
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
      decodeToken(token);
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
      <div className="p-4">
        <Routes>
          {/* Route for Home page */}
          <Route 
            path="/" 
            element={
              token ? 
                <Navigate to={isAdmin ? "/admin-dashboard" : "/my-flashcards"} replace /> 
                : 
                <Home /> 
            } 
          />

          {/* Route for SignIn page */}
          <Route 
            path="/signin" 
            element={
              token ? 
                <Navigate to={isAdmin ? "/admin-dashboard" : "/my-flashcards"} replace /> 
                : 
                <SignIn setToken={setToken} /> 
            } 
          />

          {/* Route for SignUp page */}
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route 
            path="/create" 
            element={
              token ? <CreateFlashcards /> : <Navigate to="/signin" replace />
            } 
          />
          <Route 
            path="/my-flashcards" 
            element={
              token ? <MyFlashcards /> : <Navigate to="/signin" replace />
            } 
          />
          <Route 
            path="/collection" 
            element={
              token ? <Collectionpage /> : <Navigate to="/signin" replace />
            } 
          />
          <Route 
            path="/flashcard" 
            element={
              token ? <Flashcard set={{ id: 1, name: 'Test Set' }} onBack={() => {}} /> 
                    : 
              <Navigate to="/signin" replace />
            } 
          />
          <Route 
            path="/settings" 
            element={
              token ? <Settings /> : <Navigate to="/signin" replace />
            } 
          />

          {/* Admin Dashboard only accessible if the user is an admin */}
          <Route 
            path="/admin-dashboard" 
            element={
              token && isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />
            } 
          />

          {/* Catch-all Route for Undefined Paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;