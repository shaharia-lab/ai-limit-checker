/**
 * Claude CLI types
 */

export interface ClaudeUsageResponse {
  type: string;
  subtype: string;
  is_error: boolean;
  duration_ms: number;
  duration_api_ms: number;
  num_turns: number;
  result: string;
  session_id: string;
  total_cost_usd: number;
  usage: ClaudeUsage;
  modelUsage: Record<string, unknown>;
  service_tier: string;
}

export interface ClaudeUsage {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
}

export interface ClaudeStatusInfo {
  sessionUsed: number;
  sessionResetTime: string;
  weeklyUsed: number;
  weeklyResetTime: string;
  hasSubscription: boolean;
}
