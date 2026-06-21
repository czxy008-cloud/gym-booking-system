import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CoachListPage from './pages/CoachListPage.jsx';
import CoachDetailPage from './pages/CoachDetailPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/coaches" element={<CoachListPage />} />
          <Route path="/coaches/:id" element={<CoachDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/reviews/new" element={<ReviewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
