import { Button } from './ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ResumeReview } from './ResumeReview';
import { JobRecommendations } from './JobRecommendations';

interface ResultsScreenProps {
  fileName: string;
  resumeFile?: File;
  desiredJobs: string;
  employmentType: string;
  yearInSchool: string;
  onBack: () => void;
}

export function ResultsScreen({ fileName, resumeFile, desiredJobs, employmentType, yearInSchool, onBack }: ResultsScreenProps) {
  return (
    <div className="space-y-8">
      {/* Header with JobGenie title */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            JobGenie
          </h1>
          <Sparkles className="h-8 w-8 text-cyan-500 animate-pulse" />
        </div>
        
        <Button
          onClick={onBack}
          variant="outline"
          className="mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Start New Search
        </Button>
      </div>

      {/* Resume Review Section */}
      <div>
        <ResumeReview 
          fileName={fileName} 
          resumeFile={resumeFile} 
          desiredJobs={desiredJobs}
          employmentType={employmentType}
          yearInSchool={yearInSchool}
        />
      </div>

      {/* Job Recommendations Section */}
      <div>
        <JobRecommendations 
          fileName={fileName}
          desiredJobs={desiredJobs}
          employmentType={employmentType}
          yearInSchool={yearInSchool}
        />
      </div>
    </div>
  );
}