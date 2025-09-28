import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { MapPin, Calendar, DollarSign, Building, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { apiService, Job, JobSearchRequest } from '../services/api';

interface JobRecommendationsProps {
  fileName: string;
  desiredJobs: string;
  employmentType: string;
  yearInSchool: string;
}

export function JobRecommendations({ fileName, desiredJobs, employmentType, yearInSchool }: JobRecommendationsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const searchRequest: JobSearchRequest = {
          fileName,
          desiredJobs,
          employmentType,
          yearInSchool
        };

        const response = await apiService.searchJobs(searchRequest);
        
        if (response.success) {
          setJobs(response.data);
        } else {
          setError(response.message || 'Failed to load job recommendations');
        }
      } catch (err) {
        setError('An error occurred while loading job recommendations');
        console.error('Job search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    searchJobs();
  }, [fileName, desiredJobs, employmentType, yearInSchool]);

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
    if (score >= 80) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-xl shadow-purple-500/10">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
              <p className="text-muted-foreground">Finding the best job matches for you...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 shadow-xl shadow-red-500/10">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-xl shadow-purple-500/10">
        <CardHeader className="text-center">
          <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Recommended Positions
          </CardTitle>
          <p className="text-muted-foreground">
            Based on your preferences: {desiredJobs} • {employmentType === 'both' ? 'Full-time & Internships' : employmentType}
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        {jobs.map((job) => (
          <Card key={job.id} className="bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{job.posted}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getMatchColor(job.matchScore)}>
                    {job.matchScore}% Match
                  </Badge>
                  <Badge variant="outline">
                    {job.type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Requirements:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                  onClick={() => window.open(job.link, '_blank')}
                  disabled={!job.link}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}