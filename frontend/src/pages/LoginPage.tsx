import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { email: 'admin@acme.test', label: 'Acme Admin' },
    { email: 'user@acme.test', label: 'Acme User' },
    { email: 'admin@globex.test', label: 'Globex Admin' },
    { email: 'user@globex.test', label: 'Globex User' }
  ];

  return (
    <div style={{
      maxWidth: 400,
      margin: '100px auto',
      padding: 20,
      border: '1px solid #ddd',
      borderRadius: 8
    }}>
      <h2 style={{ textAlign: 'center' }}>SaaS Notes Login</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4
            }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 4
            }}
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', margin: '16px 0' }}>
      <span>Don't have an account? </span>
     <button
    type="button"
    onClick={() => window.location.href = '/signup'}
    style={{
      background: 'none',
      border: 'none',
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer'
      }}
      >
     Sign up here
    </button>
  </div>

      
      <div style={{ marginTop: 20 }}>
        <h4>Test Accounts (password: password)</h4>
        {testAccounts.map(account => (
          <button
            key={account.email}
            onClick={() => {
              setEmail(account.email);
              setPassword('password');
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: 8,
              margin: '4px 0',
              backgroundColor: '#f8f9fa',
              border: '1px solid #ddd',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {account.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
