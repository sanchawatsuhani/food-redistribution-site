export default function StatusBadge({ status }) {
  const statusClass = {
    'Available': 'badge-available',
    'Claimed': 'badge-claimed',
    'Expired': 'badge-expired',
    'Pending': 'badge-pending',
    'Completed': 'badge-completed',
    'Cancelled': 'badge-expired',
  }[status] || 'badge-available';

  return <span className={`badge ${statusClass}`}>{status}</span>;
}
