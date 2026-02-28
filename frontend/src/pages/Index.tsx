import { FileUpload } from "@/components/FileUpload";
import { QuizSettingsPanel } from "@/components/QuizSettingsPanel";
import { useQuiz } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  const { inputText, settings, isGenerating, setIsGenerating, setQuestions, setTopics } = useQuiz();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      toast.error("Please upload or paste your study notes first.");
      return;
    }
    if (inputText.trim().length < 100) {
      toast.error("Please provide more text (at least 100 characters) for better quiz generation.");
      return;
    }

    setIsGenerating(true);
    try {
      const serverUri = import.meta.env.VITE_SERVER_URI;
      if (!serverUri) {
        toast.error("Backend not configured. Please set VITE_SERVER_URI.");
        setIsGenerating(false);
        return;
      }

      const resp = await fetch(`${serverUri}/api/generate/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText, settings }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add credits to your workspace.");
        return;
      }
      if (!resp.ok) throw new Error("Failed to generate quiz");

      const response = await resp.json();
      const questions = response.data?.questions || [];
      const topics = response.data?.topics || [];
      setQuestions(questions);
      setTopics(topics);
      toast.success(`Generated ${questions.length} questions!`);
      navigate("/preview");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-1">Upload Your Notes</h2>
        <p className="text-muted-foreground">
          Paste or upload your study material and let AI generate a comprehensive quiz.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <FileUpload />
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Quiz
              </>
            )}
          </Button>
        </div>
        <QuizSettingsPanel />
      </div>
    </div>
  );
};

export default Index;
