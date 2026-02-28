import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { resultsApi, quizApi } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Clock, Calendar, Users, Trophy, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface QuizResult {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  score: number;
  totalQuestions: number;
  completedAt: string;
  timeTaken: number;
}

interface Statistics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  averageTime?: number;
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
}

const FacultyQuizResults = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId) return;

      try {
        const [quizRes, resultsRes] = await Promise.all([
          quizApi.getQuiz(quizId),
          resultsApi.getQuizResults(quizId, { page: currentPage, limit: 10 }),
        ]);

        setQuiz(quizRes.data.data as Quiz);
        setResults(resultsRes.data.data as QuizResult[]);
        setStatistics(resultsRes.data.statistics as Statistics ?? null);
        setTotalPages(resultsRes.data.pagination?.pages || 1);
      } catch (error) {
        console.error("Error fetching quiz results:", error);
        toast.error("Failed to load quiz results");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, currentPage]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/faculty/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{quiz?.title || "Quiz"} - Results</h1>
          <p className="text-muted-foreground">{quiz?.description || "View student results"}</p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-500" />
                Highest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.highestScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Lowest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.lowestScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.passRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
          <CardDescription>All submissions for this quiz</CardDescription>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.user.avatar} />
                            <AvatarFallback>
                              {result.user.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{result.user.name}</p>
                            <p className="text-sm text-muted-foreground">{result.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScoreBadgeVariant(result.score)}>
                          {result.score}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(result.timeTaken)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(result.completedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/faculty/results/${result._id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No students have attempted this quiz yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyQuizResults;
