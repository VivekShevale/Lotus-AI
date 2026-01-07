import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BotIcon,
  SproutIcon,
  FlowerIcon,
  LeafIcon,
  TreesIcon,
  Sun,
  Moon,
  LockIcon,
  MailIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  ShieldIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import api from "../configs/api";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login API call - FIXED: Added /auth prefix
        const res = await api.post("/auth/login", {
          email: email,
          password: password,
        });

        // Success - store user data and redirect
        console.log("Login successful:", res.data);
        
        // Store user data if remember me is checked
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(res.data));
          localStorage.setItem('token', res.data.token); // if you have a token
        } else {
          sessionStorage.setItem('user', JSON.stringify(res.data));
          sessionStorage.setItem('token', res.data.token); // if you have a token
        }

        setSuccessMessage(`Welcome back, ${res.data.name}!`);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard'); // Change to your desired route
        }, 1000);

      } else {
        // Register API call - FIXED: Added /auth prefix
        const res = await api.post("/auth/register", {
          name: username,
          email: email,
          password: password,
        });

        // Success - show message and switch to login
        console.log("Registration successful:", res.data);
        setSuccessMessage(`Account created successfully! Welcome, ${res.data.name}!`);
        
        // Clear form and switch to login after a short delay
        setTimeout(() => {
          setIsLogin(true);
          setPassword("");
          setSuccessMessage("");
        }, 2000);
      }
    } catch (err) {
      // Better error handling
      let errorMessage = "Something went wrong. Please try again.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.errors) {
        // Handle validation errors from marshmallow
        const errors = err.response.data.errors;
        if (typeof errors === 'object') {
          errorMessage = Object.values(errors).flat().join(', ');
        } else {
          errorMessage = errors;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const authFeatures = [
    {
      icon: ShieldIcon,
      title: "Secure Growth",
      description: "Your data is encrypted and protected like a forest canopy",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: SparklesIcon,
      title: "Smart Cultivation",
      description: "Personalized AI models tailored to your needs",
      color: "text-violet-500",
      bgColor: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      icon: TreesIcon,
      title: "Branch Out",
      description: "Access a diverse ecosystem of machine learning models",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200 to-rose-200 dark:from-emerald-900 dark:to-rose-900 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-amber-200 to-violet-200 dark:from-amber-900 dark:to-violet-900 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8">
          {/* Left Panel - Features */}
          <div className="lg:w-2/5 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-rose-100 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-rose-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BotIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Forest AI
                </span>
              </Link>

              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Cultivate Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-rose-500">
                  AI Garden
                </span>
              </h1>
              <p className="text-gray-600 dark:text-zinc-400 text-lg">
                Join our ecosystem of machine learning models and grow your AI
                projects like a thriving forest.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {authFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl ${feature.bgColor} border border-rose-100 dark:border-zinc-800 backdrop-blur-sm transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl ${feature.bgColor} border border-rose-200 dark:border-zinc-700`}
                    >
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-rose-100 dark:border-zinc-700">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  150+
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  Models
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-rose-100 dark:border-zinc-700">
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  2.5K
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  Growers
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-rose-100 dark:border-zinc-700">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  99.8%
                </div>
                <div className="text-xs text-gray-600 dark:text-zinc-400">
                  Uptime
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Auth Form */}
          <div className="lg:w-3/5">
            <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-3xl border-2 border-rose-100 dark:border-zinc-800 shadow-2xl p-8 lg:p-10">
              {/* Toggle Switch */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative bg-rose-50 dark:bg-zinc-800 rounded-full p-1 border border-rose-200 dark:border-zinc-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                        isLogin
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                          : "text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <LeafIcon className="w-4 h-4" />
                        Enter the Forest
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                        setSuccessMessage("");
                      }}
                      className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                        !isLogin
                          ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25"
                          : "text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <SproutIcon className="w-4 h-4" />
                        Plant Seeds
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-fadeIn">
                    <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 animate-fadeIn">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Forest Alias
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your unique forest alias"
                        className="w-full pl-10 pr-4 py-3 border border-rose-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                        required={!isLogin}
                        disabled={isLoading}
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    Forest Mail
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your forest mail address"
                      className="w-full pl-10 pr-4 py-3 border border-rose-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <MailIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                    <LockIcon className="w-4 h-4" />
                    Secret Roots
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your secret roots"
                      className="w-full pl-10 pr-12 py-3 border border-rose-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <LockIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-rose-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-400"
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700 dark:text-zinc-300">
                        Remember my roots
                      </span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                    >
                      Lost your roots?
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      <span>
                        {isLogin ? "Entering..." : "Planting..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isLogin ? "Enter the Forest" : "Plant Your Seeds"}
                      </span>
                      <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-rose-200 dark:border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/70 dark:bg-zinc-900/70 text-gray-500 dark:text-zinc-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="py-3 px-4 border border-rose-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center gap-2 group"
                    disabled={isLoading}
                  >
                    <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="py-3 px-4 border border-rose-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 text-gray-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors duration-200 flex items-center justify-center gap-2 group"
                    disabled={isLoading}
                  >
                    <Moon className="w-4 h-4 text-violet-500 group-hover:rotate-12 transition-transform" />
                    <span>GitHub</span>
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
                  {isLogin ? "New to the forest?" : "Already have roots?"}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    {isLogin ? "Plant your seeds" : "Enter the forest"}
                  </button>
                </p>

                <div className="text-xs text-center text-gray-500 dark:text-zinc-500 pt-4 border-t border-rose-100 dark:border-zinc-800">
                  <p className="flex items-center justify-center gap-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    By cultivating here, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="text-rose-500 hover:text-rose-600"
                    >
                      Forest Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-rose-500 hover:text-rose-600"
                    >
                      Growth Policy
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Floating elements */}
      <div className="fixed bottom-4 right-4 flex gap-2">
        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-rose-400 rounded-full animate-bounce delay-75"></div>
        <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce delay-150"></div>
      </div>
    </div>
  );
};

export default AuthPage;