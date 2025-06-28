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

export interface AggregatedTableProps {
  aggregatedData: Record<string, unknown>[];
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
  data: Record<string, unknown>[];
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

export {};
