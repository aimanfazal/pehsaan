import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PostCard({ post, currentUserId, onDelete }) {
  const fullName = `${post.first_name} ${post.last_name || ''}`.trim();

  return (
    <div className="card post-card">
      <div className="post-header">
        <div className="post-header-left">
          <Avatar firstName={post.first_name} lastName={post.last_name} to={`/profile/${post.user_id}`} />
          <div>
            <div className="post-author">
              <Link to={`/profile/${post.user_id}`}>{fullName}</Link>
            </div>
            <div className="post-time">{timeAgo(post.created_at)}</div>
          </div>
        </div>
        {post.user_id === currentUserId && (
          <button className="link-btn" onClick={() => onDelete(post.id)}>Delete</button>
        )}
      </div>
      <div className="post-content">{post.content}</div>
    </div>
  );
}
