import AnswerList, { AnswerListProps } from "./AnswerList";

type Props = Omit<AnswerListProps, "mode">;

const SingleChoiceEditor = (props: Props) => <AnswerList {...props} mode="single" />;

export default SingleChoiceEditor;
