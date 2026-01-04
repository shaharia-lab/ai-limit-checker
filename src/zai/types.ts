/**
 * Z.ai API response types
 */

export interface ZaiUsageDetail {
  modelCode: string;
  usage: number;
}

export interface ZaiLimit {
  type: string;
  unit: number;
  number: number;
  usage: number;
  currentValue: number;
  remaining: number;
  percentage: number;
  nextResetTime?: number;
  usageDetails?: ZaiUsageDetail[];
}

export interface ZaiUsageResponse {
  code: number;
  msg: string;
  data: {
    limits: ZaiLimit[];
  };
  success: boolean;
}
