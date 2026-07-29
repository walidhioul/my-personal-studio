import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { AdminEvaluationQuiz } from "@/api/evaluationQuizzes";

interface Props {
  quizzes: AdminEvaluationQuiz[];
  isLoading: boolean;
  onView: (quiz: AdminEvaluationQuiz) => void;
  onEdit: (quiz: AdminEvaluationQuiz) => void;
  onDelete: (quiz: AdminEvaluationQuiz) => void;
}

const EvaluationQuizTable = ({ quizzes, isLoading, onView, onEdit, onDelete }: Props) => (
  <div className="border rounded-lg bg-card overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead>Questions</TableHead>
          <TableHead>Passing Score</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead className="hidden lg:table-cell">Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              {Array.from({ length: 7 }).map((__, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : quizzes.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
              No evaluation quizzes found.
            </TableCell>
          </TableRow>
        ) : (
          quizzes.map((q) => (
            <TableRow key={q.id}>
              <TableCell className="font-medium">{q.title}</TableCell>
              <TableCell className="hidden md:table-cell max-w-[280px] truncate text-muted-foreground">
                {q.description}
              </TableCell>
              <TableCell>{q.questions?.length ?? 0}</TableCell>
              <TableCell>{q.passing_score}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="secondary">{q.type}</Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {q.created_at ? new Date(q.created_at).toLocaleDateString() : "—"}
              </TableCell>
              <TableCell className="text-right space-x-2 whitespace-nowrap">
                <Button size="sm" variant="outline" aria-label={`View ${q.title}`} onClick={() => onView(q)}>
                  <Eye size={14} />
                </Button>
                <Button size="sm" variant="outline" aria-label={`Edit ${q.title}`} onClick={() => onEdit(q)}>
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  aria-label={`Delete ${q.title}`}
                  onClick={() => onDelete(q)}
                >
                  <Trash2 size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

export default EvaluationQuizTable;
