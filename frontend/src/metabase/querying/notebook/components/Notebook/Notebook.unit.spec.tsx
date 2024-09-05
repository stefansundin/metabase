import userEvent from "@testing-library/user-event";

import {
  setupDatabasesEndpoints,
  setupRecentViewsEndpoints,
  setupSearchEndpoints,
} from "__support__/server-mocks";
import {
  mockScrollBy,
  renderWithProviders,
  screen,
  waitForLoaderToBeRemoved,
  within,
} from "__support__/ui";
import { createMockRecentModel } from "metabase/browse/test-utils";
import {
  SAMPLE_METADATA,
  createQueryWithClauses,
} from "metabase-lib/test-helpers";
import Question from "metabase-lib/v1/Question";
import type { CardType, RecentItem } from "metabase-types/api";
import {
  createMockCard,
  createMockCollectionItem,
  createMockDatabase,
  createMockRecentCollectionItem,
  createMockRecentTableItem,
} from "metabase-types/api/mocks";

import { Notebook, type NotebookProps } from "./Notebook";

type SetupOpts = {
  question: Question;
  reportTimezone?: string;
  readOnly?: boolean;
  isRunnable?: boolean;
  isDirty?: boolean;
  isResultDirty?: boolean;
  hasVisualizeButton?: boolean;
} & Pick<NotebookProps, "models">;

console.warn = jest.fn();

const TEST_SEARCH_RESULTS = [
  createMockCollectionItem({
    name: "Card",
    model: "card",
  }),
  createMockCollectionItem({
    name: "Model",
    model: "dataset",
  }),
  createMockCollectionItem({
    name: "Metric",
    model: "metric",
  }),
];

const TEST_RECENT_TABLE = createMockRecentTableItem();
const TEST_RECENT_MODEL = createMockRecentModel({ name: "My Cool Model" });
const TEST_RECENT_QUESTION = createMockRecentCollectionItem();
const TEST_RECENT_VIEWS_RESULTS = [
  TEST_RECENT_TABLE,
  TEST_RECENT_MODEL,
  TEST_RECENT_QUESTION,
];

function setup({
  question,
  reportTimezone = "UTC",
  readOnly = false,
  isRunnable = false,
  isDirty = false,
  isResultDirty = false,
  hasVisualizeButton = false,
  models,
}: SetupOpts) {
  const updateQuestion = jest.fn();
  const runQuestionQuery = jest.fn();
  const setQueryBuilderMode = jest.fn();

  mockScrollBy();
  setupRecentViewsEndpoints(TEST_RECENT_VIEWS_RESULTS);
  setupSearchEndpoints(TEST_SEARCH_RESULTS);
  setupDatabasesEndpoints([createMockDatabase()]);

  renderWithProviders(
    <Notebook
      question={question}
      reportTimezone={reportTimezone}
      readOnly={readOnly}
      isRunnable={isRunnable}
      isDirty={isDirty}
      isResultDirty={isResultDirty}
      hasVisualizeButton={hasVisualizeButton}
      updateQuestion={updateQuestion}
      runQuestionQuery={runQuestionQuery}
      setQueryBuilderMode={setQueryBuilderMode}
      models={models}
    />,
  );

  return { updateQuestion, runQuestionQuery, setQueryBuilderMode };
}

function createSummarizedQuestion(type: CardType) {
  const query = createQueryWithClauses({
    aggregations: [{ operatorName: "count" }],
  });
  return new Question(createMockCard({ type }), SAMPLE_METADATA).setQuery(
    query,
  );
}

describe("Notebook", () => {
  it.each<CardType>(["question", "model"])(
    "should have regular copy for the summarize step for %s queries",
    type => {
      setup({
        question: createSummarizedQuestion(type),
      });

      const step = screen.getByTestId("step-summarize-0-0");
      expect(within(step).getByText("Summarize")).toBeInTheDocument();
      expect(within(step).getByText("by")).toBeInTheDocument();
      expect(within(step).getByLabelText("Remove step")).toBeInTheDocument();
      expect(within(step).queryByText("Formula")).not.toBeInTheDocument();
      expect(
        within(step).queryByText("Default time dimension"),
      ).not.toBeInTheDocument();
    },
  );

  it("should have metric-specific copy for the summarize step", () => {
    setup({
      question: createSummarizedQuestion("metric"),
    });

    const step = screen.getByTestId("step-summarize-0-0");
    expect(within(step).getByText("Formula")).toBeInTheDocument();
    expect(
      within(step).getAllByText("Default time dimension").length,
    ).toBeGreaterThanOrEqual(1);
    expect(within(step).queryByText("Summarize")).not.toBeInTheDocument();
    expect(within(step).queryByText("by")).not.toBeInTheDocument();
    expect(
      within(step).queryByLabelText("Remove step"),
    ).not.toBeInTheDocument();
  });

  it.each<CardType>(["question", "model"])(
    "should be able to remove the summarize step for %s queries",
    type => {
      setup({
        question: createSummarizedQuestion(type),
      });

      const step = screen.getByTestId("step-summarize-0-0");
      expect(within(step).getByLabelText("Remove step")).toBeInTheDocument();
    },
  );

  it("should not be able to remove the summarize step for metrics", () => {
    setup({
      question: createSummarizedQuestion("metric"),
    });

    const step = screen.getByTestId("step-summarize-0-0");
    expect(
      within(step).queryByLabelText("Remove step"),
    ).not.toBeInTheDocument();
  });

  describe("which models should show when filtering by model type", () => {
    describe.each<RecentItem & { tabName: string }>([
      { ...TEST_RECENT_MODEL, tabName: "Models" },
      { ...TEST_RECENT_QUESTION, tabName: "Saved questions" },
      { ...TEST_RECENT_TABLE, tabName: "Tables" },
    ])("when filtering by $model", ({ model, tabName, display_name, name }) => {
      const modelType = model as "metric" | "table" | "dataset" | "card";

      it(`should only show 'Recents' and ${tabName} when ${modelType} is the only specified filter`, async () => {
        setup({
          question: new Question(createMockCard()),
          models: [modelType],
        });

        await userEvent.click(screen.getByText("Pick your starting data"));

        await waitForLoaderToBeRemoved();

        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(2);
        expect(tabs.map(elem => elem.textContent)).toEqual([
          "Recents",
          tabName,
        ]);
      });

      it(`should only show ${modelType} in recents when models = [${modelType}]`, async () => {
        setup({
          question: new Question(createMockCard()),
          models: [modelType],
        });

        await userEvent.click(screen.getByText("Pick your starting data"));

        await waitForLoaderToBeRemoved();

        const searchName = display_name || name;

        expect(
          within(screen.getByTestId("result-item")).getByText(searchName),
        ).toBeInTheDocument();
      });
    });
  });
});
