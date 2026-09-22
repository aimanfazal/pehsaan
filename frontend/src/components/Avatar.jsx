import React from 'react';
import { Link } from 'react-router-dom';

const PALETTE = ['#2f5d50', '#8a5a2b', '#3c5a80', '#6b4a7a', '#a3452e', '#3a6b5a'];

function colorFor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || '';
  const b = (lastName || '').trim()[0] || '';
  return (a + b).toUpperCase() || '?';
}

export default function Avatar({ firstName, lastName, size = 36, to, className = '' }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: colorFor(`${firstName || ''}${lastName || ''}`),
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 650,
    fontSize: Math.max(11, size * 0.4),
    flexShrink: 0,
    userSelect: 'none'
  };

  const el = <div className={`avatar ${className}`} style={style}>{initials(firstName, lastName)}</div>;
  return to ? <Link to={to} className="avatar-link">{el}</Link> : el;
}
