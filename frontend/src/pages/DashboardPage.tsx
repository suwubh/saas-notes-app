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
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

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
            backgroundColor: isAtLimit ? '#6c757d' : '#007bff',
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
        <h3>Your Notes ({notes.length})</h3>
        
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
              <h4>{note.title}</h4>
              <p>{note.content}</p>
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
                    backgroundColor: '#dc3545',
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
