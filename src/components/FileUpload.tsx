import { useCallback, useRef, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuiz } from "@/context/QuizContext";
import { toast } from "sonner";

export function FileUpload() {
  const { inputText, setInputText } = useQuiz();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".txt")) {
        toast.error("Currently only .txt files are supported. PDF/DOCX support coming soon!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const cleaned = text
          .replace(/\f/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        setInputText(cleaned);
        setFileName(file.name);
        toast.success(`Loaded: ${file.name}`);
      };
      reader.readAsText(file);
    },
    [setInputText]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging ? "border-primary bg-accent" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Drag & drop a .txt file or{" "}
          <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">PDF & DOCX support coming soon</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm bg-accent/50 rounded-md px-3 py-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="flex-1">{fileName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFileName(null);
              setInputText("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="relative">
        <Textarea
          placeholder="Or paste your study notes here..."
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setFileName(null);
          }}
          className="min-h-[200px] resize-y"
        />
        <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
          {inputText.length} chars
        </span>
      </div>
    </div>
  );
}
