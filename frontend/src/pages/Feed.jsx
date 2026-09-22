import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import Avatar from '../components/Avatar.jsx';

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  const loadFeed = async () => {
    try {
      const data = await api('/posts');
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api('/posts', { method: 'POST', body: JSON.stringify({ content }) });
      setContent('');
      await loadFeed();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/posts/${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <div className="card composer">
        <Avatar firstName={user.first_name} lastName={user.last_name} />
        <form onSubmit={handlePost} className="composer-form">
          <textarea
            placeholder="Share an update..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="composer-actions">
            <button type="submit" className="primary" disabled={!content.trim() || posting}>
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      {posts === null && (
        <div className="empty-state">
          <span className="spinner" />
          <p>Loading feed…</p>
        </div>
      )}
      {posts && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✦</div>
          <p>No posts yet.</p>
          <p className="muted">Connect with people or write the first update above.</p>
        </div>
      )}
      {posts && posts.map((p) => (
        <PostCard key={p.id} post={p} currentUserId={user.id} onDelete={handleDelete} />
      ))}
    </div>
  );
}
