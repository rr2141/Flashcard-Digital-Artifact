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
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for existing token and admin status
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken); 
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        setIsAdmin(decoded.admin);
      } catch (error) {
        console.error("Error decoding token: ", error);
      }
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    console.log('Logout function called'); // Debugging
    localStorage.removeItem('token');  
    setToken(null);  
    setIsAdmin(false); 
  };

  return (
    <Router>
      <Navigation username="user" onLogout={handleLogout} />
      <div className="p-4">
        <Routes>
          {/* Route for Home page */}
          <Route path="/" element={token ? <Home /> : <SignIn setToken={setToken} />} />
         
          {/* Routes for Flashcards and other pages, only accessible if logged in */}
          <Route path="/create" element={token ? <CreateFlashcards /> : <SignIn setToken={setToken} />} />
          <Route path="/my-flashcards" element={token ? <MyFlashcards /> : <SignIn setToken={setToken} />} />
          <Route path="/Collection" element={token ? <Collectionpage /> : <SignIn setToken={setToken} />} />
          <Route path="/Flashcard" element={token ? <Flashcard set={{ id: 1, name: 'Test Set' }} onBack={() => {}} /> : <SignIn setToken={setToken} />} />
          <Route path="/Settings" element={token ? <Settings /> : <SignIn setToken={setToken} />} />
         
          {/* Admin Dashboard only accessible if the user is an admin */}
          <Route path="/AdminDashboard" element={token && isAdmin ? <AdminDashboard /> : <Navigate to="/AdminDashboard" />} />
          
          {/* Route for SignUp page */}
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;