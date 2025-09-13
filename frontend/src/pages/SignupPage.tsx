import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('acme');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/signup', { email, password, tenantSlug });
      setSuccess('Signup successful! Please login.');
      setEmail('');
      setPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ 
        maxWidth: 400, 
        width: '100%',
        padding: 32,
        backgroundColor: 'white',
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Join SaaS Notes</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
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
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
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

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Select Your Company
            </label>
            <select
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 12, 
                border: '1px solid #ddd',
                borderRadius: 4,
                backgroundColor: 'white'
              }}
            >
              <option value="acme">🏢 Acme Corporation</option>
              <option value="globex">🌐 Globex Industries</option>
            </select>
          </div>

          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginBottom: 16, 
              padding: 8,
              backgroundColor: '#f8d7da',
              borderRadius: 4 
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ 
              color: '#155724', 
              marginBottom: 16,
              padding: 8,
              backgroundColor: '#d4edda',
              borderRadius: 4 
            }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              padding: 12,
              backgroundColor: '#1A1A40',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span>Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#1A1A40',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Sign in here
          </button>
        </div>

        <div style={{ 
          marginTop: 20, 
          padding: 12, 
          backgroundColor: '#e9ecef',
          borderRadius: 4,
          fontSize: 14,
          color: '#6c757d'
        }}>
          <strong>📝 New Account Details:</strong><br />
          • Default Role: Member<br />
          • Default Plan: Free (3 notes limit)<br />
          • Admins can upgrade to Pro later
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
