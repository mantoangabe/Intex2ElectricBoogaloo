interface PredictionBadgeProps {
  probability: number;
}

export default function PredictionBadge({ probability }: PredictionBadgeProps) {
  const tier =
    probability >= 0.66 ? 'High' :
    probability >= 0.33 ? 'Medium' :
    'Low';

  return (
    <span
      className={`status-badge ${
        tier === 'High' ? 'status-critical' : tier === 'Medium' ? 'status-pending' : 'status-active'
      }`}
    >
      {tier}
    </span>
  );
}
