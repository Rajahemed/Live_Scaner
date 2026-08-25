export interface ScannerEvent {
  id: string;
  symbol: string;
  security_id: string;
  exchange: string;
  segment: string;
  scan_date: string;
  trigger_timestamp: string;
  minute_timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  current_price: number;
  current_volume: number;
  average_1min_volume: number;
  volume_multiplier: number;
  current_traded_value: number;
  relative_volume_threshold: number;
  absolute_value_threshold: number;
  volume_condition: boolean;
  value_condition: boolean;
  triggered: boolean;
  trigger_reason: string;
  baseline_days: number;
  data_source: string;
  created_at: string;
  updated_at: string;
}

export interface MinuteData {
  id: string;
  symbol: string;
  security_id: string;
  exchange: string;
  segment: string;
  minute_timestamp: string;
  scan_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  traded_value: number;
  average_1min_volume: number;
  volume_multiplier: number;
  volume_threshold: number;
  value_threshold: number;
  volume_condition: boolean;
  value_condition: boolean;
  triggered: boolean;
  baseline_days: number;
  data_source: string;
  created_at: string;
  updated_at: string;
}

export interface SummaryStats {
  counts: {
    "20x_30x": number;
    "30x_50x": number;
    "50x_100x": number;
    "100x_plus": number;
  };
  total: number;
  top_spikes: ScannerEvent[];
  top_value: ScannerEvent[];
}

export interface SystemStatus {
  status: string;
  google_sheets_connected: boolean;
}
