import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Navigation from './components/navigation';
import Home from './pages/Home';
import Flashcard from './pages/Flashcard';
import CreateFlashcards from './pages/CreateFlashcards';
import MyFlashcards from './pages/MyFlashcards';
import Collectionpage from './pages/Collection';
import SignIn from './components/signin';
import SignUp from './components/signup';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  // Checks to see if the token is already stored in localStorage
  // Sets the token if it's found
  //Checks if user is admin or not
  // Errors if token not found
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken); 
      try {
        const decoded = JSON.parse(atob(storedToken.split('.')[1]));
        setIsAdmin(decoded.admin);
      }
      catch (error){
        console.error("Error decoding token: ", error);
      }
    }
  }, []);

  // The Logout function to remove the token and the admin
  const handleLogout = () => {
    localStorage.removeItem('token');  
    setToken(null);  
    setIsAdmin(false); 
  };

  return (
    <Router>
      <Navigation username="user" token={token} onLogout={handleLogout} />
      <div className="p-4">
        <Routes>
          {/* Route for Home page */}
          <Route path="/" element={token ? <Home /> : <SignIn setToken={setToken} />} />
         
          {/* Routes for Flashcards and other pages, only accessible if logged in */}
          <Route path="/create" element={token ? <CreateFlashcards /> : <SignIn setToken={setToken} />} />
          <Route path="/my-flashcards" element={token ? <MyFlashcards /> : <SignIn setToken={setToken} />} />
          <Route path="/Collection" element={token ? <Collectionpage/> : <SignIn setToken={setToken} />} />
          <Route path="/Flashcard" element={token ? <Flashcard/> : <SignIn setToken={setToken} />} />
         
          {/* Admin Dashboard only accessible if the user is an admin */}
          <Route path="/AdminDashboard" element={token && isAdmin ? <AdminDashboard /> : <Navigate to="/" />}/>
          
           {/* Route for SignUp page */}
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
