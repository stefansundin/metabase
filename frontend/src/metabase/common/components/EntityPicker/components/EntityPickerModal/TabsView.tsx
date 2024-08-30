import { Icon, Tabs } from "metabase/ui";
import type { SearchResultId } from "metabase-types/api";

import type {
  EntityPickerTab,
  EntityPickerTabId,
  EntityPickerTabRenderProps,
  TypeWithModel,
} from "../../types";

interface Props<
  Id extends SearchResultId,
  Model extends string,
  Item extends TypeWithModel<Id, Model>,
> {
  selectedTabId: EntityPickerTabId;
  tabs: EntityPickerTab<Id, Model, Item>[];
  onItemSelect: EntityPickerTabRenderProps<Id, Model, Item>["onItemSelect"];
  onTabChange: (tabId: EntityPickerTabId) => void;
}

export const TabsView = <
  Id extends SearchResultId,
  Model extends string,
  Item extends TypeWithModel<Id, Model>,
>({
  selectedTabId,
  tabs,
  onItemSelect,
  onTabChange,
}: Props<Id, Model, Item>) => {
  return (
    <Tabs
      keepMounted
      value={selectedTabId}
      style={{
        flexGrow: 1,
        height: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Tabs.List px="1rem">
        {tabs.map(tab => {
          const { id, icon, displayName } = tab;

          return (
            <Tabs.Tab
              key={id}
              value={id}
              icon={<Icon name={icon} />}
              onClick={() => onTabChange(id)}
            >
              {displayName}
            </Tabs.Tab>
          );
        })}
      </Tabs.List>

      {tabs.map(tab => {
        const { id } = tab;

        return (
          <Tabs.Panel
            key={id}
            value={id}
            style={{
              flexGrow: 1,
              height: 0,
            }}
          >
            {tab.render({ onItemSelect })}
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
};
