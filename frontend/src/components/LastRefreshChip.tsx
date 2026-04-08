import type { PredictionMeta } from '../types/predictions';

interface LastRefreshChipProps {
  meta: PredictionMeta | null;
  label: string;
}

export default function LastRefreshChip({ meta, label }: LastRefreshChipProps) {
  if (!meta) return <small>{label}: no scored batch yet</small>;

  return (
    <small>
      {label}: predictions refreshed nightly • last run {new Date(meta.scoredAt).toLocaleString()} • {meta.modelVersion}
    </small>
  );
}
