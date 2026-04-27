export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

export const formatRelativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export const formatDuration = (months) => months === 1 ? '1 month' : `${months} months`;

export const truncateText = (text, max) => (text && text.length > max) ? text.substring(0, max) + '...' : text;

export const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '';

export const getPGTypeLabel = (type) => ({ male: 'Boys PG', female: 'Girls PG', 'co-ed': 'Co-ed PG' })[type] || type;

export const getStatusColor = (status) => ({
  confirmed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-error',
  completed: 'badge-neutral'
})[status] || 'badge-neutral';