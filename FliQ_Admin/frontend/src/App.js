import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './components/Home/Home';
import Categories from './pages/Categories/Categories';
import Questions from './pages/Questions/Questions';
import MovieNews from './pages/MovieNews/MovieNews';
import MovieCategory from './pages/MovieReviews/MovieCategory/MovieCategory';
import Banners from './pages/Banners/Banners';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]); 
  
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // For Memoizing
  const ProtectedRoute = useMemo(() => {
    return ({ children }) => (token ? children : <Navigate to="/" replace />);
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home user={user} />
            </ProtectedRoute>
          } 
        >
          <Route index element={<Categories />} />
          <Route path='categories' element={<Categories />} />
          <Route path='questions' element={<Questions />} />
          <Route path='news' element={<MovieNews />} />
          <Route path='reviews' element={<MovieCategory />} />
          <Route path='banners' element={<Banners />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
