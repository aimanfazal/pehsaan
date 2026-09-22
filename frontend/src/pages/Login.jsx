import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      login(data.token, data.user);
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="container center-card">
        <div className="card">
          <div className="brand-block">
            <p className="tagline">Paisa Ya Pehchaan?</p>
            <h1 className="brand-title">Pehsaan</h1>
            <p className="dialogue">"Money follows my brother! Money follows!"</p>
          </div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="primary full-width">Log in</button>
          </form>
          <p className="muted">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
