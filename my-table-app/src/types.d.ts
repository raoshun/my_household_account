// 家計簿データ1件
export interface HouseholdRecord {
  [key: string]: unknown;
  '日付'?: string;
  '大項目'?: string;
  '中項目'?: string;
  '金額（円）'?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor?: string[];
    hoverBackgroundColor?: string[];
    [key: string]: unknown;
  }[];
}

export interface TrendDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
}
export interface TrendData {
  labels: string[];
  datasets: TrendDataset[];
}

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
