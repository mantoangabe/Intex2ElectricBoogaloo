export type OkrMetricKey =
  | 'highLapseCount'
  | 'highLowProgressCount'
  | 'highIncidentCount'
  | 'avgPredictedDonationUsd';

export interface OkrDefinition {
  id: string;
  objective: string;
  keyResult: string;
  owner: string;
  period: string;
  metricKey: OkrMetricKey;
  unit: 'count' | 'usd';
  direction: 'lower' | 'higher';
  baseline: number;
  target: number;
}

export const OKR_DEFINITIONS: OkrDefinition[] = [
  {
    id: 'okr-1-kr-1',
    objective: 'Objective 1: Increase donor retention stability',
    keyResult: 'Reduce high donor lapse-risk queue size',
    owner: 'Development Lead',
    period: 'Q2 2026',
    metricKey: 'highLapseCount',
    unit: 'count',
    direction: 'lower',
    baseline: 220,
    target: 180,
  },
  {
    id: 'okr-2-kr-1',
    objective: 'Objective 2: Improve resident progress outcomes',
    keyResult: 'Reduce residents in high "low progress" risk band',
    owner: 'Case Management Lead',
    period: 'Q2 2026',
    metricKey: 'highLowProgressCount',
    unit: 'count',
    direction: 'lower',
    baseline: 85,
    target: 65,
  },
  {
    id: 'okr-3-kr-1',
    objective: 'Objective 3: Improve proactive safety intervention',
    keyResult: 'Reduce residents in high incident risk band',
    owner: 'Protection Officer',
    period: 'Q2 2026',
    metricKey: 'highIncidentCount',
    unit: 'count',
    direction: 'lower',
    baseline: 72,
    target: 55,
  },
  {
    id: 'okr-4-kr-1',
    objective: 'Objective 4: Grow donation impact from social content',
    keyResult: 'Increase average predicted donation value per top post',
    owner: 'Marketing Lead',
    period: 'Q2 2026',
    metricKey: 'avgPredictedDonationUsd',
    unit: 'usd',
    direction: 'higher',
    baseline: 22000,
    target: 28000,
  },
];

