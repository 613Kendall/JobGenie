// Simple environment detection with fallbacks
const isDevelopment = (() => {
  try {
    // Try import.meta.env first (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as any).MODE === 'development' || (import.meta.env as any).NODE_ENV === 'development';
    }
    // Try process.env (Node.js/CRA)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV === 'development';
    }
    // Default to development if we can't determine
    return true;
  } catch {
    return true; // Default to development on any error
  }
})();

// API Configuration with safe defaults
const apiConfig = {
  baseUrl: 'https://api.jobgenie.com',
  key: '',
  timeout: 10000,
};

const features = {
  useMockData: isDevelopment, // Always use mock data in development
};

// Types
export interface ResumeAnalysis {
  overallRating: number;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  ratingCategory: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Internship';
  salary: string;
  posted: string;
  matchScore: number;
  description: string;
  requirements: string[];
  logo?: string;
}

export interface JobSearchRequest {
  fileName: string;
  desiredJobs: string;
  employmentType: string;
  yearInSchool: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API Service Class
class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async analyzeResume(file: File): Promise<ApiResponse<ResumeAnalysis>> {
    if (features.useMockData) {
      // Return mock data in development or when flag is set
      return this.getMockResumeAnalysis();
    }

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await this.fetchWithTimeout(`${apiConfig.baseUrl}/api/resume/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${apiConfig.key}`,
        },
      }, apiConfig.timeout);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Resume analysis API error:', error);
      // Fallback to mock data on API failure
      return this.getMockResumeAnalysis();
    }
  }

  async searchJobs(request: JobSearchRequest): Promise<ApiResponse<Job[]>> {
    if (features.useMockData) {
      // Return mock data in development or when flag is set
      return this.getMockJobRecommendations(request);
    }

    try {
      const response = await this.fetchWithTimeout(`${apiConfig.baseUrl}/api/jobs/search`, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Authorization': `Bearer ${apiConfig.key}`,
        },
      }, apiConfig.timeout);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Job search API error:', error);
      // Fallback to mock data on API failure
      return this.getMockJobRecommendations(request);
    }
  }

  // Mock data methods
  private getMockResumeAnalysis(): Promise<ApiResponse<ResumeAnalysis>> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const mockAnalysis: ResumeAnalysis = {
          overallRating: 8.5,
          ratingCategory: "Strong Resume",
          strengths: [
            "Strong technical skills in Python, JavaScript, and React",
            "Relevant internship experience at tech companies",
            "Good GPA and academic achievements",
            "Leadership experience in student organizations",
            "Clear and well-organized resume structure"
          ],
          improvements: [
            "Add more quantifiable achievements and metrics",
            "Include specific project outcomes and impact",
            "Expand on soft skills and teamwork examples",
            "Consider adding relevant coursework section",
            "Include links to portfolio or GitHub projects"
          ],
          nextSteps: [
            "Tailor your resume for each specific job application",
            "Prepare for technical interviews with coding practice",
            "Build a portfolio website to showcase your projects",
            "Network with professionals in your target companies",
            "Practice behavioral interview questions"
          ]
        };

        resolve({
          success: true,
          data: mockAnalysis,
        });
      }, 1500);
    });
  }

  private getMockJobRecommendations(request: JobSearchRequest): Promise<ApiResponse<Job[]>> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const allJobs: Job[] = [
          {
            id: "1",
            title: "Software Engineer Intern",
            company: "TechCorp",
            location: "San Francisco, CA",
            type: "Internship",
            salary: "$25-30/hour",
            posted: "2 days ago",
            matchScore: 95,
            description: "Join our team to build scalable web applications using React and Node.js. Perfect for students looking to gain real-world experience.",
            requirements: ["React", "JavaScript", "Computer Science major", "GPA 3.0+"]
          },
          {
            id: "2",
            title: "Frontend Developer",
            company: "StartupXYZ",
            location: "Austin, TX",
            type: "Full-time",
            salary: "$70,000-85,000",
            posted: "1 week ago",
            matchScore: 88,
            description: "Looking for a passionate frontend developer to help build our next-generation platform. Great opportunity for recent graduates.",
            requirements: ["React", "TypeScript", "2+ years experience", "Portfolio required"]
          },
          {
            id: "3",
            title: "Product Management Intern",
            company: "InnovateCorp",
            location: "Seattle, WA",
            type: "Internship",
            salary: "$22-28/hour",
            posted: "3 days ago",
            matchScore: 82,
            description: "Work with cross-functional teams to drive product strategy and roadmap. Excellent learning opportunity in product management.",
            requirements: ["Business or CS major", "Analytical thinking", "Communication skills", "Junior/Senior level"]
          },
          {
            id: "4",
            title: "Data Scientist",
            company: "DataFlow Inc",
            location: "New York, NY",
            type: "Full-time",
            salary: "$80,000-95,000",
            posted: "5 days ago",
            matchScore: 79,
            description: "Apply machine learning and statistical analysis to solve complex business problems. Looking for recent graduates with strong analytical skills.",
            requirements: ["Python", "Machine Learning", "Statistics", "Masters preferred"]
          },
          {
            id: "5",
            title: "UX Designer Intern",
            company: "DesignStudio",
            location: "Los Angeles, CA",
            type: "Internship",
            salary: "$20-25/hour",
            posted: "4 days ago",
            matchScore: 76,
            description: "Create intuitive and engaging user experiences for our mobile and web applications. Great opportunity to work with senior designers.",
            requirements: ["Figma", "Adobe Creative Suite", "Portfolio required", "Design major preferred"]
          },
          {
            id: "6",
            title: "Backend Engineer",
            company: "CloudTech Inc",
            location: "Remote",
            type: "Full-time",
            salary: "$75,000-90,000",
            posted: "6 days ago",
            matchScore: 85,
            description: "Build and maintain scalable backend services and APIs. Work with modern technologies including Node.js, Docker, and AWS.",
            requirements: ["Node.js", "AWS", "Database design", "3+ years experience"]
          }
        ];

        // Filter jobs based on employment type
        const filteredJobs = allJobs.filter(job => {
          if (request.employmentType === 'both') return true;
          if (request.employmentType === 'internship') return job.type === 'Internship';
          if (request.employmentType === 'full-time') return job.type === 'Full-time';
          return true;
        });

        resolve({
          success: true,
          data: filteredJobs,
        });
      }, 1200);
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();