import { useQuiz } from "@/context/QuizContext";
import { QuizCard } from "@/components/QuizCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizPreview = () => {
  const { questions, setQuestions, topics } = useQuiz();
  const navigate = useNavigate();

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Quiz Generated Yet</h2>
        <p className="text-muted-foreground mb-4">Upload your notes and generate a quiz first.</p>
        <Button onClick={() => navigate("/")}>Go to Upload</Button>
      </div>
    );
  }

  const handleUpdate = (index: number, q: typeof questions[0]) => {
    const updated = [...questions];
    updated[index] = q;
    setQuestions(updated);
  };

  const handleDelete = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Quiz Preview</h2>
          <p className="text-sm text-muted-foreground">{questions.length} questions generated</p>
        </div>
        <Button onClick={() => navigate("/quiz")}>
          <Play className="mr-2 h-4 w-4" /> Start Quiz
        </Button>
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <Badge key={t} variant="secondary">
              {t}
            </Badge>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {questions.map((q, i) => (
          <QuizCard
            key={q.id}
            question={q}
            index={i}
            onUpdate={(updated) => handleUpdate(i, updated)}
            onDelete={() => handleDelete(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizPreview;
