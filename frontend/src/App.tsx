import { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { UploadForm } from './components/UploadForm';
import { ResultsScreen } from './components/ResultsScreen';

interface FormData {
  fileName: string;
  resumeFile: File;
  desiredJobs: string;
  employmentType: string;
  yearInSchool: string;
}

export default function App() {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setShowResults(true);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setFormData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {showResults && formData ? (
          <ResultsScreen
            fileName={formData.fileName}
            resumeFile={formData.resumeFile}
            desiredJobs={formData.desiredJobs}
            employmentType={formData.employmentType}
            yearInSchool={formData.yearInSchool}
            onBack={handleBackToForm}
          />
        ) : (
          <>
            <HeroSection />
            <UploadForm onSubmit={handleFormSubmit} />
          </>
        )}
      </div>
    </div>
  );
}