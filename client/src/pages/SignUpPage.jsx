import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GridPattern = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    ></div>
  </div>
);

const SignUpPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp, authUser, checkAuthUser } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await checkAuthUser();
      if (user) {
        navigate('/recruiter');
      }
    };
    checkAuth();
  }, [checkAuthUser, navigate]);

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) {
      await signup(formData);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] font-sans text-white flex items-center justify-center p-4 relative overflow-hidden">
      <GridPattern />
      
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#ccff00] rounded-full blur-[180px] opacity-[0.05] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#10b981] rounded-full blur-[150px] opacity-[0.05] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-3xl p-8 md:p-12">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/20 mb-6">
              <Brain className="w-8 h-8 text-[#ccff00]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tighter mb-2">
              Create Account
            </h1>
            <p className="text-white/60 text-sm">
              Get started with AI-powered interview practice
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-3 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white/30" />
                </div>
                <input
                  type="text"
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl",
                    "text-white placeholder-white/30 focus:outline-none",
                    "focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20",
                    "transition-all duration-200"
                  )}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-3 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white/30" />
                </div>
                <input
                  type="email"
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl",
                    "text-white placeholder-white/30 focus:outline-none",
                    "focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20",
                    "transition-all duration-200"
                  )}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-3 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white/30" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl",
                    "text-white placeholder-white/30 focus:outline-none",
                    "focus:border-[#ccff00]/50 focus:ring-2 focus:ring-[#ccff00]/20",
                    "transition-all duration-200"
                  )}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white/60 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className={cn(
                "w-full px-6 py-3 rounded-full text-sm font-medium tracking-wide",
                "bg-[#ccff00] text-black hover:bg-[#b3e600] border border-[#ccff00]",
                "shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:shadow-[0_0_30px_rgba(204,255,0,0.6)]",
                "transition-all duration-300 flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#ccff00] hover:text-[#b3e600] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
