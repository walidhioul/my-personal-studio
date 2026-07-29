import AnswerList, { AnswerListProps } from "./AnswerList";

type Props = Omit<AnswerListProps, "mode">;

const MultipleChoiceEditor = (props: Props) => <AnswerList {...props} mode="multiple" />;

export default MultipleChoiceEditor;
