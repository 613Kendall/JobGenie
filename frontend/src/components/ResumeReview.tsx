import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, AlertCircle, TrendingUp, Star, Loader2 } from 'lucide-react';
import { apiService, ResumeAnalysis } from '../services/api';

interface ResumeReviewProps {
  fileName: string;
  resumeFile?: File;
  desiredJobs?: string;
  employmentType?: string;
  yearInSchool?: string;
}

export function ResumeReview({ fileName, resumeFile, desiredJobs, employmentType, yearInSchool }: ResumeReviewProps) {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const analyzeResume = async () => {
      if (!resumeFile) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare job data if available
        const jobData = desiredJobs && employmentType && yearInSchool ? {
          desiredJobs,
          employmentType,
          yearInSchool
        } : undefined;
        
        const response = await apiService.analyzeResume(resumeFile, jobData);
        
        if (response.success) {
          setAnalysis(response.data);
        } else {
          setError(response.message || 'Failed to analyze resume');
        }
      } catch (err) {
        setError('An error occurred while analyzing your resume');
        console.error('Resume analysis error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    analyzeResume();
  }, [resumeFile]);

  if (isLoading) {
    return (
      <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-xl shadow-purple-500/10">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
            <p className="text-muted-foreground">Analyzing your resume...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 shadow-xl shadow-red-500/10">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error || 'Unable to analyze resume'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-xl shadow-purple-500/10">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Star className="h-6 w-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Resume Analysis for {fileName}
            </span>
          </CardTitle>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="text-3xl font-bold text-green-600">{analysis.overallRating}/10</div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              {analysis.ratingCategory}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-green-200/50 dark:border-green-800/50 shadow-lg shadow-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-orange-200/50 dark:border-orange-800/50 shadow-lg shadow-orange-500/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              <span>Room for Improvement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-blue-200/50 dark:border-blue-800/50 shadow-lg shadow-blue-500/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
            <TrendingUp className="h-5 w-5" />
            <span>Next Steps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                </div>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}