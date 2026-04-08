import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import type { PredictionMeta } from '../types/predictions';

export function usePredictionMeta(endpoint: string, enabled = true) {
  const [meta, setMeta] = useState<PredictionMeta | null>(null);

  useEffect(() => {
    if (!enabled) return;
    apiClient
      .get<PredictionMeta>(endpoint)
      .then(res => setMeta(res.data))
      .catch(() => setMeta(null));
  }, [endpoint, enabled]);

  return meta;
}
