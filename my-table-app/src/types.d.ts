import '@testing-library/jest-dom';
/// <reference types="@testing-library/jest-dom" />

// ChartData, TrendData, HouseholdRecord などの型定義
export type ChartData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
    [key: string]: unknown;
  }[];
};

export type TrendData = {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    [key: string]: unknown;
  }[];
};

export type HouseholdRecord = {
  date: string;
  category: string;
  item: string;
  amount: number;
  memo?: string;
  [key: string]: unknown;
};

export interface AppProps {
  initialData?: HouseholdRecord[];
}

export type AggregatedCategory = { total: number; items: unknown[] };

export interface AggregatedTableProps {
  aggregatedData: Record<string, AggregatedCategory>;
}
export interface BalanceViewProps {
  positiveTotal: number;
  negativeTotal: number;
  positiveData: ChartData;
  negativeData: ChartData;
  data: Record<string, unknown>[];
  onHover?: (info: { label: string; subtotal: number; [key: string]: unknown }) => void;
}
export interface CategoryDetailsTableProps {
  category: string;
  data: Record<string, unknown>[];
  onBack?: () => void;
  title?: string;
}
export interface CategoryPieChartProps {
  data: Record<string, number>;
  onHover?: (info: { label: string; subtotal: number; [key: string]: unknown }) => void;
}
export interface CategoryQuadrantViewProps {
  data: Record<string, unknown>[];
  negativeTotal: number;
}
export interface ChartsProps {
  positiveChartData: ChartData;
  negativeChartData: ChartData;
  positiveTotal: number;
  negativeTotal: number;
  options?: Record<string, unknown>;
  onHover?: (info: { label: string; subtotal: number; [key: string]: unknown }) => void;
  onClick?: (info: { label: string; subtotal: number; category: string; isPositive: boolean; color?: string }) => void;
  chartsKey?: string | number;
}
export interface DataTableProps {
  data: Record<string, unknown>[];
}
export interface InvestmentViewProps {
  data: Record<string, unknown>[];
}
export interface MonthlyTrendChartProps {
  trendData: TrendData;
  options?: Record<string, unknown>;
  showPrediction?: boolean;
  forecastPeriods?: number;
  predictionMethod?: string;
  showSavingsRate?: boolean;
}
export interface SidebarProps {
  onFileUpload: (files: FileList) => void;
  onFilterChange: (key: string, value: unknown) => void;
  filters: Record<string, unknown>;
  initialDateRange?: { startDate: string; endDate: string };
  onViewChange: (view: string) => void;
  view: string;
  activeView: string;
  dataProcessing?: boolean;
}

// 家計簿データの型（投資用）
export type InvestmentRecord = {
  '日付': string;
  '大項目': string;
  '中項目': string;
  '金額（円）': number;
  [key: string]: unknown;
};

// 家計簿データの型（支出カテゴリ用）
export type ExpenseRecord = {
  '大項目': string;
  '中項目': string;
  '金額（円）': number;
  [key: string]: unknown;
};

// Chart.jsテスト環境window拡張
export interface TestEnvWindow extends Window {
  __JEST_TEST_ENV__?: boolean;
  _env_?: { NODE_ENV?: string };
  testEnvironment?: boolean;
  process?: { env?: { NODE_ENV?: string } };
}

// ChartPluginOptions型
export interface ChartPluginOptions {
  plugins?: {
    tooltip?: Record<string, unknown>;
    legend?: Record<string, unknown>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// 予測APIの返り値型
export type PredictionResult = {
  success: boolean;
  historical_data: { year_month: string; amount: number; lower_bound?: number; upper_bound?: number }[];
  forecast_data: { year_month: string; amount: number; lower_bound?: number; upper_bound?: number }[];
  target_category?: string;
  [key: string]: unknown;
};
