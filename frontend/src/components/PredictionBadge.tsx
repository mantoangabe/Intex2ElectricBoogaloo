interface PredictionBadgeProps {
  probability: number;
}

export default function PredictionBadge({ probability }: PredictionBadgeProps) {
  const tier =
    probability >= 0.66 ? 'High' :
    probability >= 0.33 ? 'Medium' :
    'Low';

  return (
    <span className={`prediction-badge prediction-${tier.toLowerCase()}`}>
      {tier}
    </span>
  );
}
