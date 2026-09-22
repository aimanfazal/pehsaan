import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link to="/feed" className="brand">Pehsaan</Link>

      <button className="nav-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/feed" className={isActive('/feed') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Feed</Link>
        <Link to="/network" className={isActive('/network') ? 'active' : ''} onClick={() => setMenuOpen(false)}>My Network</Link>
        <Link to={`/profile/${user.id}`} className={isActive('/profile') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
          Profile
        </Link>
        <button onClick={handleLogout}>Log out</button>
        <ThemeToggle />
        <Avatar firstName={user.first_name} lastName={user.last_name} size={30} to={`/profile/${user.id}`} />
      </div>
    </nav>
  );
}
