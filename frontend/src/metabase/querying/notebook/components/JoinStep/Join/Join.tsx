import { useMemo, useState } from "react";

import * as Lib from "metabase-lib";

import { JoinComplete, type JoinCompleteProps } from "../JoinComplete";
import { JoinDraft, type JoinDraftProps } from "../JoinDraft";

type JoinProps = Pick<
  JoinDraftProps,
  "query" | "stageIndex" | "color" | "isReadOnly" | "models"
> &
  Pick<
    JoinCompleteProps,
    | "query"
    | "stageIndex"
    | "join"
    | "joinPosition"
    | "onJoinChange"
    | "color"
    | "isReadOnly"
    | "onQueryChange"
    | "models"
  >;

export function Join({
  query,
  stageIndex,
  join,
  joinPosition,
  color,
  isReadOnly,
  onJoinChange,
  onQueryChange,
  models,
}: JoinProps) {
  const draftStrategy = useMemo(() => Lib.joinStrategy(join), [join]);
  const [draftRhsTable, setDraftRhsTable] = useState<Lib.Joinable>();

  const handleJoinChange = (newJoin: Lib.Join) => {
    setDraftRhsTable(undefined);
    onJoinChange(newJoin);
  };

  if (draftRhsTable) {
    return (
      <JoinDraft
        query={query}
        stageIndex={stageIndex}
        color={color}
        initialStrategy={draftStrategy}
        initialRhsTable={draftRhsTable}
        isReadOnly={isReadOnly}
        onJoinChange={handleJoinChange}
        models={models}
      />
    );
  }

  return (
    <JoinComplete
      query={query}
      stageIndex={stageIndex}
      join={join}
      joinPosition={joinPosition}
      color={color}
      isReadOnly={isReadOnly}
      onJoinChange={handleJoinChange}
      onQueryChange={onQueryChange}
      onDraftRhsTableChange={setDraftRhsTable}
      models={models}
    />
  );
}
