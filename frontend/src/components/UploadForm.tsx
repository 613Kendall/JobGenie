import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, FileText } from 'lucide-react';

interface UploadFormProps {
  onSubmit: (data: {
    fileName: string;
    resumeFile: File;
    desiredJobs: string;
    employmentType: string;
    yearInSchool: string;
  }) => void;
}

export function UploadForm({ onSubmit }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [desiredJobs, setDesiredJobs] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [yearInSchool, setYearInSchool] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file || !desiredJobs || !employmentType || !yearInSchool) {
      alert('Please fill in all fields');
      return;
    }

    // Pass data to parent component
    onSubmit({
      fileName: file.name,
      resumeFile: file,
      desiredJobs,
      employmentType,
      yearInSchool
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-card/80 backdrop-blur-sm border-white/20 shadow-xl shadow-purple-500/10">
      <CardHeader className="text-center">
        <CardTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Get Started with JobGenie
        </CardTitle>
        <p className="text-muted-foreground">
          Upload your resume and tell us about your career goals
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDF Upload */}
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">Upload Your Resume (PDF)</Label>
            <div className="border-2 border-dashed border-purple-300/50 dark:border-purple-700/50 rounded-lg p-8 text-center hover:border-purple-500/70 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all duration-300">
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="pdf-upload" className="cursor-pointer block w-full">
                <div className="flex flex-col items-center justify-center space-y-3">
                  {file ? (
                    <>
                      <FileText className="h-10 w-10 text-green-500" />
                      <p className="text-sm font-medium text-center">{file.name}</p>
                      <p className="text-xs text-muted-foreground text-center">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-purple-400" />
                      <p className="text-sm font-medium text-center">Click to upload your PDF resume</p>
                      <p className="text-xs text-muted-foreground text-center">PDF files only</p>
                    </>
                  )}
                </div>
              </Label>
            </div>
          </div>

          {/* Desired Jobs */}
          <div className="space-y-2">
            <Label htmlFor="desired-jobs">Desired Job Positions</Label>
            <Select value={desiredJobs} onValueChange={setDesiredJobs}>
            <SelectTrigger>
                <SelectValue placeholder="Select your desired role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artificial intelligence">Artificial Intelligence</SelectItem>
                <SelectItem value="it infastucture">IT Infrastructure</SelectItem>
                <SelectItem value="project managment">Project Management</SelectItem>
                <SelectItem value="cyber security">Cyber Security</SelectItem>
                <SelectItem value="software development">Software Development</SelectItem>
                <SelectItem value="data science">Data Science</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employment Type */}
          <div className="space-y-2">
            <Label htmlFor="employment-type">Employment Type</Label>
            <Select value={employmentType} onValueChange={setEmploymentType}>
              <SelectTrigger>
                <SelectValue placeholder="Are you looking for full-time or internship positions?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time Positions</SelectItem>
                <SelectItem value="internship">Internship Positions</SelectItem>
                <SelectItem value="both">Both Full-time and Internships</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Year in School */}
          <div className="space-y-2">
            <Label htmlFor="year-in-school">Year in School</Label>
            <Select value={yearInSchool} onValueChange={setYearInSchool}>
              <SelectTrigger>
                <SelectValue placeholder="Select your current academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freshman">Freshman</SelectItem>
                <SelectItem value="sophomore">Sophomore</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="graduate">Graduate Student</SelectItem>
                <SelectItem value="recent-grad">Recent Graduate</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
            size="lg"
          >
            Start My Job Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
