import StatusBadge from './StatusBadge';
import { FiMapPin, FiClock, FiPackage, FiUser } from 'react-icons/fi';

const BACKEND_URL = 'http://localhost:3001';

export default function FoodCard({ listing, onClaim, showClaim = false, claimLoading }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    // Handle datetime-local format (YYYY-MM-DDTHH:mm) and ISO strings
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr; // fallback to raw string
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="food-card" id={`food-card-${listing.id}`}>
      {listing.imageUrl ? (
        <div className="food-card-image">
          <img src={`${BACKEND_URL}${listing.imageUrl}`} alt={listing.foodItem} loading="lazy" />
        </div>
      ) : (
        <div className="food-card-placeholder"><FiPackage size={48} /></div>
      )}
      <div className="food-card-body">
        <div className="food-card-header">
          <h3 className="food-card-title">{listing.foodItem}</h3>
          <StatusBadge status={listing.status} />
        </div>
        <div className="food-card-meta">
          <div className="food-card-meta-item">
            <FiPackage size={14} /> {listing.quantity}
          </div>
          <div className="food-card-meta-item">
            <FiMapPin size={14} /> {listing.location} • {listing.area}
          </div>
          <div className="food-card-meta-item">
            <FiClock size={14} /> Pickup: {formatDate(listing.pickupTime)}
          </div>
        </div>
        <div className="food-card-footer">
          <div className="food-card-donor">
            <FiUser size={12} /> <strong>{listing.donorName}</strong>
          </div>
          {showClaim && listing.status === 'Available' && (
            <button
              className="btn btn-accent btn-sm"
              onClick={() => onClaim(listing.id)}
              disabled={claimLoading}
              id={`claim-btn-${listing.id}`}
            >
              {claimLoading ? 'Claiming...' : 'Claim'}
            </button>
          )}
          {listing.status === 'Claimed' && listing.claimedByName && (
            <span style={{ fontSize: '0.8rem', color: 'var(--warning)' }}>
              Claimed by {listing.claimedByName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
