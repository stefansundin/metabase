import {
  QuestionEditor,
  type QuestionEditorProps,
} from "../../private/QuestionEditor";
import type { InteractiveQuestionProps } from "../InteractiveQuestion";

type CreateQuestionProps = Omit<InteractiveQuestionProps, "questionId"> &
  QuestionEditorProps;

export const CreateQuestion = ({
  plugins,
  isSaveEnabled,
  models,
  onSave,
  onBeforeSave,
}: CreateQuestionProps = {}) => (
  <QuestionEditor
    plugins={plugins}
    isSaveEnabled={isSaveEnabled}
    models={models}
    onBeforeSave={onBeforeSave}
    onSave={onSave}
  />
);
