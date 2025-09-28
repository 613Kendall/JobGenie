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
  baseUrl: 'http://localhost:2000',
  key: '',
  timeout: 30000, // Increased to 30 seconds for AI processing
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
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 100000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers, // Don't set default Content-Type, let the calling method handle it
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async analyzeResume(file: File, jobData?: { desiredJobs: string; employmentType: string; yearInSchool: string }): Promise<ApiResponse<ResumeAnalysis>> {
  
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (jobData) {
        queryParams.append('desired_jobs', jobData.desiredJobs);
        queryParams.append('job_type', jobData.employmentType);
        queryParams.append('education_level', jobData.yearInSchool);
      } else {
        // Default fallback values
        queryParams.append('desired_jobs', 'Software Engineer');
        queryParams.append('job_type', 'full_time');
        queryParams.append('education_level', 'freshman');
      }

      const response = await this.fetchWithTimeout(`${apiConfig.baseUrl}/pushUserData?${queryParams.toString()}`, {
        method: 'POST',
        body: file, // Send PDF file directly in request body
        headers: {
          'Authorization': `Bearer ${apiConfig.key}`,
          'Content-Type': 'application/pdf', // Set proper content type for PDF
        },
      }, apiConfig.timeout);

      console.log('Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Analysis complete:', result);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Resume analysis API error:', error);
   
    }
  }

  async searchJobs(request: JobSearchRequest): Promise<ApiResponse<Job[]>> {

    try {
      const response = await this.fetchWithTimeout(`${apiConfig.baseUrl}/api/jobs/search`, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json',
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
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();