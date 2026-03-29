import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiTrendingUp, FiUsers, FiAward, FiArrowRight, FiPackage } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';
import api from '../services/api';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get('/stats/impact').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/stats/leaderboard').then(r => setLeaderboard(r.data.leaderboard)).catch(() => {});
  }, []);

  const rankClass = (i) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'default';

  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-dot"></span>
            Reducing food waste in real-time
          </div>
          <h1 className="hero-title">
            Share Food,{' '}
            <span className="gradient-text">Save Lives,</span>{' '}
            <span className="accent-text">Zero Waste</span>
          </h1>
          <p className="hero-description">
            Connect surplus food from restaurants and individuals with NGOs who feed people in need. 
            Real-time matching, instant notifications, and zero food waste.
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="stats-section" id="impact-stats">
        <div className="container">
          <h2 className="section-title">Our Impact</h2>
          <p className="section-subtitle">Every meal counts. Here's what we've achieved together.</p>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon"><MdRestaurantMenu /></span>
              <div className="stat-number">{stats?.totalMealsSaved || 0}</div>
              <div className="stat-label">Meals Saved</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><FiPackage /></span>
              <div className="stat-number">{stats?.claimedListings || 0}</div>
              <div className="stat-label">Food Claimed</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><FiUsers /></span>
              <div className="stat-number">{stats?.activeDonors || 0}</div>
              <div className="stat-label">Active Donors</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon"><FiTrendingUp /></span>
              <div className="stat-number">{stats?.activeNGOs || 0}</div>
              <div className="stat-label">Partner NGOs</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to make a difference</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Post Surplus Food</h3>
              <p className="step-description">
                Restaurants and individuals list their surplus food with details like quantity, location, and pickup time.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">NGOs Get Notified</h3>
              <p className="step-description">
                NGOs in the same area instantly receive real-time notifications about available food nearby.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Claim & Pickup</h3>
              <p className="step-description">
                NGOs claim the food, schedule pickups, and deliver meals to people in need. Zero waste achieved!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <section className="leaderboard-section" id="leaderboard">
          <div className="container">
            <h2 className="section-title"><FiAward className="inline-icon" /> Top Donors</h2>
            <p className="section-subtitle">Champions of food redistribution</p>
            <div className="leaderboard-list">
              {leaderboard.map((donor, i) => (
                <div className="leaderboard-item" key={i} style={{ '--i': i }}>
                  <div className={`leaderboard-rank ${rankClass(i)}`}>{i + 1}</div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{donor.name}</div>
                    <div className="leaderboard-area">{donor.area}</div>
                  </div>
                  <div className="leaderboard-score">
                    <div className="leaderboard-count">{donor.totalDonations}</div>
                    <div className="leaderboard-label">donations</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">
          Made with <FiHeart className="heart" /> for a world without food waste — FoodShare © 2026
        </p>
      </footer>
    </div>
  );
}
