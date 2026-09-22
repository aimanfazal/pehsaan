import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import PostCard from '../components/PostCard.jsx';
import Avatar from '../components/Avatar.jsx';

function fmtDate(d) {
  if (!d) return 'Present';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
}

export default function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const isOwn = String(id) === String(user.id);

  const [profile, setProfile] = useState(null);
  const [connStatus, setConnStatus] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [showEduForm, setShowEduForm] = useState(false);
  const [eduSchool, setEduSchool] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduStart, setEduStart] = useState('');
  const [eduEnd, setEduEnd] = useState('');

  const [showJobForm, setShowJobForm] = useState(false);
  const [jobCompany, setJobCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobStart, setJobStart] = useState('');
  const [jobEnd, setJobEnd] = useState('');

  const [skillInput, setSkillInput] = useState('');

  const load = async () => {
    try {
      const data = await api(`/users/${id}`);
      setProfile(data);
      setFirstName(data.first_name);
      setLastName(data.last_name || '');
      if (!isOwn) {
        const status = await api(`/connections/status/${id}`);
        setConnStatus(status);
      }
      const userPosts = await api(`/posts/user/${id}`);
      setPosts(userPosts);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setProfile(null);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveName = async (e) => {
    e.preventDefault();
    try {
      const updated = await api('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ first_name: firstName, last_name: lastName })
      });
      setProfile(updated);
      setUser({ ...user, first_name: updated.first_name, last_name: updated.last_name });
      setEditing(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const sendRequest = async () => {
    try {
      await api(`/connections/request/${id}`, { method: 'POST' });
      setConnStatus({ status: 'pending', requested_by_me: true });
    } catch (err) {
      alert(err.message);
    }
  };

  const acceptRequest = async () => {
    try {
      await api(`/connections/accept/${id}`, { method: 'POST' });
      setConnStatus({ status: 'accepted' });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const findOrCreateSchool = async (name) => {
    const matches = await api(`/schools?q=${encodeURIComponent(name)}`);
    const exact = matches.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (exact) return exact.id;
    const created = await api('/schools', { method: 'POST', body: JSON.stringify({ name }) });
    return created.id;
  };

  const findOrCreateCompany = async (name) => {
    const matches = await api(`/companies?q=${encodeURIComponent(name)}`);
    const exact = matches.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exact) return exact.id;
    const created = await api('/companies', { method: 'POST', body: JSON.stringify({ name }) });
    return created.id;
  };

  const addEducation = async (e) => {
    e.preventDefault();
    if (!eduSchool.trim()) return;
    try {
      const schoolId = await findOrCreateSchool(eduSchool.trim());
      await api('/education', {
        method: 'POST',
        body: JSON.stringify({
          school_id: schoolId,
          degree: eduDegree || null,
          start_date: eduStart || null,
          end_date: eduEnd || null
        })
      });
      setEduSchool(''); setEduDegree(''); setEduStart(''); setEduEnd(''); setShowEduForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const removeEducation = async (eduId) => {
    try {
      await api(`/education/${eduId}`, { method: 'DELETE' });
      load();
    } catch (err) { alert(err.message); }
  };

  const addEmployment = async (e) => {
    e.preventDefault();
    if (!jobCompany.trim()) return;
    try {
      const companyId = await findOrCreateCompany(jobCompany.trim());
      await api('/employment', {
        method: 'POST',
        body: JSON.stringify({
          company_id: companyId,
          title: jobTitle || null,
          start_date: jobStart || null,
          end_date: jobEnd || null
        })
      });
      setJobCompany(''); setJobTitle(''); setJobStart(''); setJobEnd(''); setShowJobForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const removeEmployment = async (jobId) => {
    try {
      await api(`/employment/${jobId}`, { method: 'DELETE' });
      load();
    } catch (err) { alert(err.message); }
  };

  const addSkill = async (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    try {
      await api('/skills', { method: 'POST', body: JSON.stringify({ name: skillInput.trim() }) });
      setSkillInput('');
      load();
    } catch (err) { alert(err.message); }
  };

  const removeSkill = async (skillId) => {
    try {
      await api(`/skills/${skillId}`, { method: 'DELETE' });
      load();
    } catch (err) { alert(err.message); }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    try {
      await api(`/posts/${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) { alert(err.message); }
  };

  if (error) return <div className="container"><p className="error">{error}</p></div>;
  if (!profile) return (
    <div className="container">
      <div className="empty-state"><span className="spinner" /><p>Loading profile…</p></div>
    </div>
  );

  return (
    <div className="container">
      <div className="card profile-header">
        <Avatar firstName={profile.first_name} lastName={profile.last_name} size={64} />
        <div className="profile-header-info">
          {editing ? (
            <form onSubmit={saveName}>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
              <div className="row-actions">
                <button type="submit" className="primary">Save</button>
                <button type="button" className="secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h2>{profile.first_name} {profile.last_name}</h2>
              <p className="muted">@{profile.username}</p>
              <p className="muted">{profile.postCount} posts · {profile.connectionCount} connections</p>
              {isOwn && <button className="secondary" onClick={() => setEditing(true)}>Edit name</button>}
              {!isOwn && connStatus && (
                <>
                  {connStatus.status === 'none' && <button className="primary" onClick={sendRequest}>+ Connect</button>}
                  {connStatus.status === 'pending' && connStatus.requested_by_me && (
                    <span className="status-pill pending">Request sent</span>
                  )}
                  {connStatus.status === 'pending' && !connStatus.requested_by_me && (
                    <button className="primary" onClick={acceptRequest}>Accept request</button>
                  )}
                  {connStatus.status === 'accepted' && <span className="status-pill accepted">✓ Connected</span>}
                  {connStatus.status === 'rejected' && <span className="status-pill rejected">Not connected</span>}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Education</h3>
          {isOwn && <button className="link-btn" onClick={() => setShowEduForm(!showEduForm)}>{showEduForm ? 'Cancel' : '+ Add'}</button>}
        </div>
        {showEduForm && (
          <form onSubmit={addEducation} className="inline-form">
            <input placeholder="School name" value={eduSchool} onChange={(e) => setEduSchool(e.target.value)} required />
            <input placeholder="Degree" value={eduDegree} onChange={(e) => setEduDegree(e.target.value)} />
            <div className="date-row">
              <input type="date" value={eduStart} onChange={(e) => setEduStart(e.target.value)} />
              <input type="date" value={eduEnd} onChange={(e) => setEduEnd(e.target.value)} />
            </div>
            <button type="submit" className="primary">Add</button>
          </form>
        )}
        {profile.education.length === 0 && <p className="muted">No education added yet.</p>}
        {profile.education.map((e) => (
          <div className="list-item" key={e.id}>
            <div>
              <b>{e.school_name}</b>{e.degree ? ` — ${e.degree}` : ''}
              <div className="sub">{fmtDate(e.start_date)} - {fmtDate(e.end_date)}</div>
            </div>
            {isOwn && <button className="link-btn" onClick={() => removeEducation(e.id)}>Remove</button>}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-header">
          <h3>Experience</h3>
          {isOwn && <button className="link-btn" onClick={() => setShowJobForm(!showJobForm)}>{showJobForm ? 'Cancel' : '+ Add'}</button>}
        </div>
        {showJobForm && (
          <form onSubmit={addEmployment} className="inline-form">
            <input placeholder="Company name" value={jobCompany} onChange={(e) => setJobCompany(e.target.value)} required />
            <input placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <div className="date-row">
              <input type="date" value={jobStart} onChange={(e) => setJobStart(e.target.value)} />
              <input type="date" value={jobEnd} onChange={(e) => setJobEnd(e.target.value)} />
            </div>
            <button type="submit" className="primary">Add</button>
          </form>
        )}
        {profile.employment.length === 0 && <p className="muted">No experience added yet.</p>}
        {profile.employment.map((job) => (
          <div className="list-item" key={job.id}>
            <div>
              <b>{job.title || 'Role'}</b> at {job.company_name}
              <div className="sub">{fmtDate(job.start_date)} - {fmtDate(job.end_date)}</div>
            </div>
            {isOwn && <button className="link-btn" onClick={() => removeEmployment(job.id)}>Remove</button>}
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Skills</h3>
        {isOwn && (
          <form onSubmit={addSkill} className="inline-form-row">
            <input placeholder="Add a skill..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
            <button type="submit" className="secondary">Add</button>
          </form>
        )}
        <div className="skill-chips">
          {profile.skills.length === 0 && <p className="muted">No skills added yet.</p>}
          {profile.skills.map((s) => (
            <span className="chip" key={s.id}>
              {s.name}
              {isOwn && <button className="chip-remove" onClick={() => removeSkill(s.id)}>×</button>}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Posts</h3>
        {posts.length === 0 && <p className="muted">No posts yet.</p>}
      </div>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} currentUserId={user.id} onDelete={handleDeletePost} />
      ))}
    </div>
  );
}
