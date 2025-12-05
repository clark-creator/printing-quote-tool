import React from 'react';
import { Clock, Check, XCircle } from 'lucide-react';

/**
 * Status badge component for displaying quote status
 * @param {Object} props
 * @param {string} props.status - 'pending', 'won', or 'lost'
 * @param {boolean} props.small - Whether to use smaller size
 */
export function StatusBadge({ status, small = false }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  };

  const icons = {
    pending: <Clock className={small ? "w-3 h-3" : "w-4 h-4"} />,
    won: <Check className={small ? "w-3 h-3" : "w-4 h-4"} />,
    lost: <XCircle className={small ? "w-3 h-3" : "w-4 h-4"} />
  };

  const labels = {
    pending: 'Pending',
    won: 'Won',
    lost: 'Lost'
  };

  const currentStatus = status || 'pending';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[currentStatus] || styles.pending}`}>
      {icons[currentStatus] || icons.pending}
      {labels[currentStatus] || 'Pending'}
    </span>
  );
}

export default StatusBadge;
