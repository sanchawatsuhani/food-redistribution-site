import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SERVICE_AREAS } from '../constants/areas';

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', displayName: '', role: '', area: '', contact: '', capacity: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.role) { setError('Please select a role.'); return; }
    setLoading(true);
    try {
      const user = await register({
        ...form,
        capacity: form.capacity ? parseInt(form.capacity) : 0
      });
      navigate(user.role === 'donor' ? '/donor' : '/ngo');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">🍽️</div>
          <h1 className="auth-title">Join FoodShare</h1>
          <p className="auth-subtitle">Start making a difference today</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          {error && <div className="form-error" style={{ textAlign: 'center', marginBottom: 16, padding: '10px', background: 'var(--danger-glow)', borderRadius: 'var(--radius-md)' }}>⚠️ {error}</div>}

          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              <button type="button" className={`role-option ${form.role === 'donor' ? 'selected' : ''}`} onClick={() => setForm(p => ({ ...p, role: 'donor' }))}>
                <div className="role-option-icon">🍲</div>
                <div className="role-option-label">Food Donor</div>
              </button>
              <button type="button" className={`role-option ${form.role === 'ngo' ? 'selected' : ''}`} onClick={() => setForm(p => ({ ...p, role: 'ngo' }))}>
                <div className="role-option-icon">🏢</div>
                <div className="role-option-label">NGO</div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{form.role === 'ngo' ? 'Organization Name' : 'Full Name'}</label>
            <input className="form-input" name="displayName" placeholder={form.role === 'ngo' ? 'NGO Name' : 'John Doe'} value={form.displayName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Area</label>
              <select className="form-select" name="area" value={form.area} onChange={handleChange} required>
                <option value="">Select area</option>
                {SERVICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input className="form-input" name="contact" placeholder="+1 234 567 890" value={form.contact} onChange={handleChange} />
            </div>
          </div>

          {form.role === 'ngo' && (
            <div className="form-group">
              <label className="form-label">Capacity (people you can serve)</label>
              <input className="form-input" type="number" name="capacity" placeholder="e.g. 100" value={form.capacity} onChange={handleChange} />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="register-submit">
            {loading ? 'Creating account...' : '🚀 Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
