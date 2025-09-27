import { Sparkles, Briefcase, Target } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="text-center space-y-6 mb-12">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          JobGenie
        </h1>
        <Sparkles className="h-8 w-8 text-cyan-500 animate-pulse" />
      </div>
      
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        Your AI-powered career companion that transforms your resume into targeted job opportunities
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white/70 dark:bg-card/70 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 group">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h3>Upload Resume</h3>
          <p className="text-sm text-muted-foreground text-center">
            Share your PDF resume and let AI analyze your skills and experience
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white/70 dark:bg-card/70 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 group">
          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h3>Set Goals</h3>
          <p className="text-sm text-muted-foreground text-center">
            Tell us your dream roles and career aspirations
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white/70 dark:bg-card/70 backdrop-blur-sm border border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group">
          <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-green-500 group-hover:from-cyan-600 group-hover:to-green-600 transition-all duration-300">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3>Get Matched</h3>
          <p className="text-sm text-muted-foreground text-center">
            Receive personalized job recommendations and application tips
          </p>
        </div>
      </div>
    </div>
  );
}