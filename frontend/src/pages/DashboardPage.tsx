import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import api from '../utils/api';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { notes, loading, error, createNote, deleteNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');
  
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await createNote(title, content);
      setTitle('');
      setContent('');
    } catch (err: any) {
      console.error('Failed to create note:', err.response?.data?.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    try {
      await api.post(`/tenants/${user.tenant.slug}/upgrade`);
      window.location.reload();
    } catch (err: any) {
      setUpgradeError(err.response?.data?.error || 'Upgrade failed');
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSubmitting(true);
    setInviteError('');
    setInviteSuccess('');
    
    try {
      const response = await api.post('/users/invite', {
        email: inviteEmail,
        role: inviteRole
      });
      
      setInviteSuccess(`Successfully invited ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      setInviteRole('member');
      
      
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Failed to invite user');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const canUpgrade = user?.role === 'admin' && user?.tenant.subscription_plan === 'free';
  const isAtLimit = user?.tenant.subscription_plan === 'free' && notes.length >= 3;

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', padding: 20 }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30
      }}>
        <div>
          <h1>Notes Dashboard</h1>
          <p>
            Welcome, {user?.email} ({user?.role}) - {user?.tenant.name}
            <br />
            Plan: {user?.tenant.subscription_plan?.toUpperCase()}
            {user?.tenant.subscription_plan === 'free' && (
              <span> ({notes.length}/3 notes)</span>
            )}
          </p>
        </div>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FF6F61',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      {/* Admin Invite Users Section */}
      {user?.role === 'admin' && (
        <div style={{
          padding: 20,
          border: '1px solid #1A1A40',
          borderRadius: 4,
          marginBottom: 30,
          backgroundColor: '#797988ff',
          color: 'white'
        }}>
          <h3>Admin: Invite New User</h3>
          <form onSubmit={handleInviteUser}>
            <div style={{ marginBottom: 16 }}>
              <input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                style={{
                  width: '60%',
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  marginRight: 8
                }}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                style={{
                  width: '25%',
                  padding: 12,
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  marginRight: 8
                }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                disabled={inviteSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: inviteSubmitting ? '#6c757d' : '#1A1A40',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: inviteSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {inviteSubmitting ? 'Inviting...' : 'Invite User'}
              </button>
            </div>
            
            {inviteError && (
              <div style={{ 
                color: '#dc3545', 
                marginBottom: 8,
                padding: 8,
                backgroundColor: '#f8d7da',
                borderRadius: 4,
                fontSize: 14
              }}>
                ❌ {inviteError}
              </div>
            )}
            
            {inviteSuccess && (
              <div style={{ 
                color: '#155724', 
                marginBottom: 8,
                padding: 8,
                backgroundColor: '#d4edda',
                borderRadius: 4,
                fontSize: 14
              }}>
                ✅ {inviteSuccess}
              </div>
            )}
          </form>
        </div>
      )}

      {isAtLimit && (
        <div style={{
          padding: 20,
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: 4,
          marginBottom: 20
        }}>
          <h3>Upgrade to Pro Required</h3>
          <p>You've reached the maximum of 3 notes on the Free plan.</p>
          {canUpgrade && (
            <div>
              <button
                onClick={handleUpgrade}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer'
                }}
              >
                Upgrade to Pro
              </button>
              {upgradeError && (
                <p style={{ color: 'red', marginTop: 8 }}>{upgradeError}</p>
              )}
            </div>
          )}
          {!canUpgrade && (
            <p><em>Contact your admin to upgrade to Pro plan.</em></p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        padding: 20,
        border: '1px solid #ddd',
        borderRadius: 4,
        marginBottom: 30
      }}>
        <h3>Create New Note</h3>
        <div style={{ marginBottom: 16 }}>
          <input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isAtLimit}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <textarea
            placeholder="Note content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={isAtLimit}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              height: 100,
              resize: 'vertical'
            }}
          />
        </div>
        <button
          type="submit"
          disabled={submitting || isAtLimit}
          style={{
            padding: '12px 24px',
            backgroundColor: isAtLimit ? '#6c757d' : '#1A1A40',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: isAtLimit ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting ? 'Creating...' : 'Create Note'}
        </button>
      </form>

      <div>
        <h3>
          {user?.role === 'admin' ? 'All Tenant Notes' : 'Your Notes'} ({notes.length})
        </h3>
        
        {loading && <p>Loading notes...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        
        {notes.length === 0 && !loading && (
          <p>No notes yet. Create your first note above!</p>
        )}
        
        <div style={{ display: 'grid', gap: 16 }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: 20,
                border: '1px solid #ddd',
                borderRadius: 4,
                backgroundColor: '#f8f9fa'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4>{note.title}</h4>
                  <p>{note.content}</p>
                  {user?.role === 'admin' && note.author_email && (
                    <small style={{ color: '#007bff', fontWeight: 'bold' }}>
                      👤 Author: {note.author_email}
                    </small>
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16
              }}>
                <small style={{ color: '#6c757d' }}>
                  Created: {new Date(note.created_at).toLocaleDateString()}
                </small>
                <button
                  onClick={() => deleteNote(note.id)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#FF6F61',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
