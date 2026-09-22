import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Avatar from '../components/Avatar.jsx';

function UserRow({ u, action }) {
  const fullName = `${u.first_name} ${u.last_name || ''}`.trim();
  return (
    <div className="user-row">
      <div className="user-row-left">
        <Avatar firstName={u.first_name} lastName={u.last_name} size={40} to={`/profile/${u.id}`} />
        <div className="info">
          <Link to={`/profile/${u.id}`}>{fullName}</Link>
          <span className="sub">@{u.username}</span>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function Network() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState(null);
  const [connections, setConnections] = useState(null);
  const [sentTo, setSentTo] = useState({});

  const loadPending = async () => {
    setPending(await api('/connections/pending'));
  };
  const loadConnections = async () => {
    setConnections(await api('/connections'));
  };

  useEffect(() => {
    loadPending();
    loadConnections();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        setResults(await api(`/users/search?q=${encodeURIComponent(query)}`));
      } catch (err) {
        // ignore search errors inline
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const sendRequest = async (userId) => {
    try {
      await api(`/connections/request/${userId}`, { method: 'POST' });
      setSentTo((prev) => ({ ...prev, [userId]: true }));
    } catch (err) {
      alert(err.message);
    }
  };

  const accept = async (userId) => {
    try {
      await api(`/connections/accept/${userId}`, { method: 'POST' });
      loadPending();
      loadConnections();
    } catch (err) {
      alert(err.message);
    }
  };

  const reject = async (userId) => {
    try {
      await api(`/connections/reject/${userId}`, { method: 'POST' });
      loadPending();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h3>Find people</h3>
        <input
          type="text"
          placeholder="Search by name or username..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {results.length > 0 && results.map((u) => (
          <UserRow
            key={u.id}
            u={u}
            action={
              sentTo[u.id]
                ? <button className="secondary" disabled>Request sent</button>
                : <button className="secondary" onClick={() => sendRequest(u.id)}>+ Connect</button>
            }
          />
        ))}
        {query.trim() && results.length === 0 && <p className="muted inline-hint">No matches.</p>}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Pending requests</h3>
          {pending && pending.length > 0 && <span className="badge">{pending.length}</span>}
        </div>
        {pending === null && <p className="muted inline-hint">Loading…</p>}
        {pending && pending.length === 0 && <p className="muted inline-hint">No pending requests.</p>}
        {pending && pending.map((u) => (
          <UserRow
            key={u.id}
            u={u}
            action={
              <div className="row-actions">
                <button className="primary" onClick={() => accept(u.id)}>Accept</button>
                <button className="secondary" onClick={() => reject(u.id)}>Ignore</button>
              </div>
            }
          />
        ))}
      </div>

      <div className="card">
        <h3>Your connections</h3>
        {connections === null && <p className="muted inline-hint">Loading…</p>}
        {connections && connections.length === 0 && (
          <p className="muted inline-hint">No connections yet. Search for people above!</p>
        )}
        {connections && connections.map((u) => <UserRow key={u.id} u={u} />)}
      </div>
    </div>
  );
}
