import { ArrowRight, Sparkles, BarChart3, Zap, TrendingUp, Target } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 transition-colors duration-300">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Enhanced Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-green-200/30 dark:bg-green-500/10 rounded-full blur-3xl animate-float delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 mb-8 group cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-blue-600/20 dark:bg-blue-400/20 rounded-full animate-ping"></div>
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Advanced ML Analysis Platform
              </span>
            </div>
          </div>

          {/* Enhanced Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
              Predict with
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient-x">
              Precision & Power
            </span>
          </h1>

          {/* Enhanced Subheading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
            Harness the power of <span className="font-semibold text-blue-600 dark:text-blue-400">Linear Regression</span> and{' '}
            <span className="font-semibold text-purple-600 dark:text-purple-400">Logistic Classification</span> with automated preprocessing, 
            real-time visualizations, and enterprise-grade performance metrics.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-400 dark:hover:to-purple-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-400/25 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <TrendingUp className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Regression Analysis</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-700 dark:text-gray-200 font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-95">
              <Target className="w-5 h-5" />
              <span>Try Classification</span>
            </button>
          </div>

          {/* Enhanced Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Get results in seconds with optimized algorithms",
                color: "blue",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: BarChart3,
                title: "Smart Preprocessing",
                description: "Auto-handling of missing values & feature encoding",
                color: "purple",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: TrendingUp,
                title: "Real-time Charts",
                description: "Interactive visualizations & performance metrics",
                color: "green",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Sparkles,
                title: "Model Insights",
                description: "Feature importance & prediction explanations",
                color: "orange",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <div 
                key={feature.title}
                className="group bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { value: "99.9%", label: "Accuracy" },
              { value: "2s", label: "Processing Time" },
              { value: "50+", label: "Features" },
              { value: "24/7", label: "Availability" }
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Trust Badge */}
          <div className="mt-16 flex flex-col items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 font-medium">TRUSTED BY DATA TEAMS AT</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-70 hover:opacity-100 transition-opacity duration-300">
              {['TechCorp', 'DataFlow', 'Analytica', 'InsightLabs', 'StatWise', 'MLPro'].map((company) => (
                <div 
                  key={company} 
                  className="text-gray-600 dark:text-gray-300 font-semibold text-lg hover:text-gray-900 dark:hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}