import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { t } from "ttag";

import { Icon, Popover, Tooltip } from "metabase/ui";
import * as Lib from "metabase-lib";

import {
  NotebookCellItem,
  type NotebookCellItemProps,
} from "../../NotebookCell";
import {
  NotebookDataPicker,
  type NotebookDataPickerProps,
} from "../../NotebookDataPicker";

import { ColumnPickerButton } from "./JoinTablePicker.styled";

export type JoinTablePickerProps = {
  isReadOnly: boolean;
} & Pick<NotebookCellItemProps, "color"> &
  JoinTableColumnPickerProps &
  Pick<
    NotebookDataPickerProps,
    "table" | "query" | "stageIndex" | "onChange" | "models"
  >;

export function JoinTablePicker({
  query,
  stageIndex,
  table,
  color,
  isReadOnly,
  columnPicker,
  onChange,
  models,
}: JoinTablePickerProps) {
  const databaseId = useMemo(() => Lib.databaseID(query), [query]);
  const isDisabled = isReadOnly;

  return (
    <NotebookCellItem
      inactive={!table}
      readOnly={isReadOnly}
      disabled={isDisabled}
      color={color}
      right={
        table != null && !isReadOnly ? (
          <JoinTableColumnPicker columnPicker={columnPicker} />
        ) : null
      }
      containerStyle={CONTAINER_STYLE}
      rightContainerStyle={RIGHT_CONTAINER_STYLE}
      aria-label={t`Right table`}
    >
      <NotebookDataPicker
        title={t`Pick data to join`}
        query={query}
        stageIndex={stageIndex}
        table={table}
        databaseId={databaseId ?? undefined}
        placeholder={t`Pick data…`}
        isDisabled={isDisabled}
        onChange={onChange}
        models={models}
      />
    </NotebookCellItem>
  );
}

export type JoinTableColumnPickerProps = {
  columnPicker: ReactNode;
};

function JoinTableColumnPicker({ columnPicker }: JoinTableColumnPickerProps) {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Popover opened={isOpened} onChange={setIsOpened}>
      <Popover.Target>
        <Tooltip label={t`Pick columns`}>
          <ColumnPickerButton
            onClick={() => setIsOpened(!isOpened)}
            aria-label={t`Pick columns`}
            data-testid="fields-picker"
          >
            <Icon name="chevrondown" />
          </ColumnPickerButton>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>{columnPicker}</Popover.Dropdown>
    </Popover>
  );
}

const CONTAINER_STYLE = {
  padding: 0,
};

const RIGHT_CONTAINER_STYLE = {
  width: 37,
  height: 37,
  padding: 0,
};
