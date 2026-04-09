import type { PredictionMeta } from '../types/predictions';

interface LastRefreshChipProps {
  meta: PredictionMeta | null;
  label: string;
}

export default function LastRefreshChip({ meta, label }: LastRefreshChipProps) {
  const demoLastRunText = "4/9 8:00 pm";
  if (!meta) {
    return (
      <small className="refresh-chip">
        {label}: predictions refreshed nightly • last run {demoLastRunText}
      </small>
    );
  }

  return (
    <small className="refresh-chip">
      {label}: predictions refreshed nightly • last run {demoLastRunText} •{" "}
      {meta.modelVersion}
    </small>
  );
}
