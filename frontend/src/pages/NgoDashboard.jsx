import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import StatusBadge from '../components/StatusBadge';
import { SERVICE_AREAS } from '../constants/areas';
import { FiFilter, FiCheckCircle, FiPackage, FiClock } from 'react-icons/fi';

const AREAS = ['All Areas', ...SERVICE_AREAS];

export default function NgoDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ngo') navigate('/login');
  }, [user, authLoading, navigate]);

  const fetchListings = useCallback(async () => {
    try {
      const params = {};
      if (areaFilter !== 'All Areas') params.area = areaFilter;
      params.status = 'Available';
      const res = await api.get('/food', { params });
      setListings(res.data.listings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [areaFilter]);

  const fetchPickups = useCallback(async () => {
    try {
      const res = await api.get('/pickups');
      setPickups(res.data.pickups);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'ngo') return;
    fetchListings();
    fetchPickups();
  }, [authLoading, user, fetchListings, fetchPickups]);

  // Real-time Socket.IO
  useEffect(() => {
    if (authLoading || !user || user.role !== 'ngo') return;
    const socket = getSocket();
    const onCreated = (listing) => {
      if (areaFilter === 'All Areas' || listing.area === areaFilter) {
        setListings(prev => [listing, ...prev]);
      }
    };
    const onClaimed = (data) => {
      setListings(prev => prev.filter(l => l.id !== data.listing.id));
      fetchPickups();
    };
    const onExpired = (data) => {
      setListings(prev => prev.filter(l => l.id !== data.foodId));
    };
    socket.on('food:created', onCreated);
    socket.on('food:claimed', onClaimed);
    socket.on('food:expired', onExpired);
    return () => {
      socket.off('food:created', onCreated);
      socket.off('food:claimed', onClaimed);
      socket.off('food:expired', onExpired);
    };
  }, [authLoading, user, areaFilter, fetchPickups]);

  const handleClaim = async (foodId) => {
    setClaimLoading(foodId);
    try {
      await api.put(`/food/${foodId}/claim`);
      setListings(prev => prev.filter(l => l.id !== foodId));
      fetchPickups();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to claim.');
    } finally {
      setClaimLoading(null);
    }
  };

  const handleComplete = async (pickupId) => {
    try {
      await api.put(`/pickups/${pickupId}/complete`);
      fetchPickups();
    } catch (err) { console.error(err); }
  };

  if (authLoading) {
    return (
      <div className="page">
        <div className="loading" style={{ minHeight: '40vh' }}><div className="spinner"></div></div>
      </div>
    );
  }
  if (!user || user.role !== 'ngo') return null;

  const pending = pickups.filter(p => p.status === 'Pending');
  const completed = pickups.filter(p => p.status === 'Completed');

  return (
    <div className="page">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user.displayName}</h1>
          <p>Browse available food and manage your pickups</p>
        </div>

        {/* Stats */}
        <div className="dashboard-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon primary"><FiPackage size={22} /></div>
            <div><div className="dash-stat-value">{listings.length}</div><div className="dash-stat-label">Available Now</div></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon warning"><FiClock size={22} /></div>
            <div><div className="dash-stat-value">{pending.length}</div><div className="dash-stat-label">Pending Pickups</div></div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon accent"><FiCheckCircle size={22} /></div>
            <div><div className="dash-stat-value">{completed.length}</div><div className="dash-stat-label">Completed</div></div>
          </div>
        </div>

        {/* Available Food */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Available Food <span className="live-indicator"><span className="live-dot"></span> Live</span></h2>
            <div className="filter-bar">
              <FiFilter size={16} style={{ color: 'var(--text-muted)' }} />
              <select className="form-select" value={areaFilter} onChange={e => { setAreaFilter(e.target.value); setLoading(true); }} id="area-filter">
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <div className="empty-state-title">No food available</div>
              <div className="empty-state-text">
                {areaFilter !== 'All Areas' ? `No listings in ${areaFilter}. Try another area.` : 'Check back soon — new donations appear in real-time!'}
              </div>
            </div>
          ) : (
            <div className="food-grid">
              {listings.map(l => (
                <FoodCard key={l.id} listing={l} showClaim onClaim={handleClaim} claimLoading={claimLoading === l.id} />
              ))}
            </div>
          )}
        </div>

        {/* Pending Pickups */}
        {pending.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header"><h2>Pending Pickups</h2></div>
            <div className="pickups-list">
              {pending.map(p => (
                <div className="pickup-card" key={p.id}>
                  <div className="pickup-info">
                    <div className="pickup-food">{p.foodItem}</div>
                    <div className="pickup-details">
                      <span>Location: {p.location} • {p.area}</span>
                      <span>Qty: {p.quantity}</span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                  <div className="pickup-actions">
                    <button className="btn btn-accent btn-sm" onClick={() => handleComplete(p.id)}>Complete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header"><h2>Completed Pickups</h2></div>
            <div className="pickups-list">
              {completed.slice(0, 5).map(p => (
                <div className="pickup-card" key={p.id}>
                  <div className="pickup-info">
                    <div className="pickup-food">{p.foodItem}</div>
                    <div className="pickup-details">
                      <span>Area: {p.area}</span>
                      <span>Qty: {p.quantity}</span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
