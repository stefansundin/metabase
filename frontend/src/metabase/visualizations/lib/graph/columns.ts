import { DatasetData, VisualizationSettings } from "metabase-types/api";
import { isNotNull } from "metabase/core/utils/types";
import {
  RemappingHydratedChartData,
  RemappingHydratedDatasetColumn,
} from "metabase/visualizations/shared/types/data";

export type ColumnDescriptor = {
  index: number;
  column: RemappingHydratedDatasetColumn;
};

export const getColumnDescriptor = (
  columnName: string,
  columns: RemappingHydratedDatasetColumn[],
): ColumnDescriptor => {
  const index = columns.findIndex(column => column.name === columnName);

  return {
    index,
    column: columns[index],
  };
};

export const getColumnDescriptors = (
  columnNames: string[],
  columns: RemappingHydratedDatasetColumn[],
): ColumnDescriptor[] => {
  return columnNames.map(columnName =>
    getColumnDescriptor(columnName, columns),
  );
};

export const hasValidColumnsSelected = (
  visualizationSettings: VisualizationSettings,
  data: DatasetData,
) => {
  const metricColumns = (visualizationSettings["graph.metrics"] ?? [])
    .map(metricColumnName =>
      data.cols.find(column => column.name === metricColumnName),
    )
    .filter(isNotNull);

  const dimensionColumns = (visualizationSettings["graph.dimensions"] ?? [])
    .map(dimensionColumnName =>
      data.cols.find(column => column.name === dimensionColumnName),
    )
    .filter(isNotNull);

  return metricColumns.length > 0 && dimensionColumns.length > 0;
};

export type BreakoutChartColumns = {
  dimension: ColumnDescriptor;
  breakout: ColumnDescriptor;
  metric: ColumnDescriptor;
};

export type MultipleMetricsChartColumns = {
  dimension: ColumnDescriptor;
  metrics: ColumnDescriptor[];
};

export type ChartColumns = BreakoutChartColumns | MultipleMetricsChartColumns;

export const getChartColumns = (
  data: RemappingHydratedChartData,
  visualizationSettings: VisualizationSettings,
): ChartColumns => {
  const [dimension, breakout] = getColumnDescriptors(
    (visualizationSettings["graph.dimensions"] ?? []).filter(isNotNull),
    data.cols,
  );

  const metrics = getColumnDescriptors(
    (visualizationSettings["graph.metrics"] ?? []).filter(isNotNull),
    data.cols,
  );

  if (breakout) {
    return {
      dimension,
      breakout,
      metric: metrics[0],
    };
  }

  return {
    dimension,
    metrics,
  };
};
