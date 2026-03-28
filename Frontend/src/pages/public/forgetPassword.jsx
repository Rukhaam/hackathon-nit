import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPasswordAPI, resetPasswordAPI } from "../../api/authApi";
import { useToast } from "../../hooks/toastHook";
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { showSuccess, showError, showLoading, dismissToast } = useToast();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingId = showLoading("Sending recovery code...");

    try {
      const data = await forgotPasswordAPI(email);
      dismissToast(loadingId);
      showSuccess(data.message || "Reset code sent to your email! 📧");
      setStep(2); 
    } catch (err) {
      dismissToast(loadingId);
      showError(err.response?.data?.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingId = showLoading("Updating your password...");

    try {
      const data = await resetPasswordAPI({
        email,
        token,
        newPassword,
      });
      
      dismissToast(loadingId);
      showSuccess(data.message || "Password reset successfully! 🎉");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      dismissToast(loadingId);
      showError(err.response?.data?.message || "Failed to reset password. Check your code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Premium Background Glow Effect */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 sm:p-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            {step === 1 ? (
              <KeyRound className="w-8 h-8 text-blue-600" />
            ) : (
              <Lock className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {step === 1 ? "Forgot Password?" : "Set New Password"}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed px-4">
            {step === 1 
              ? "No worries, we'll send you reset instructions." 
              : "We've sent a 6-digit code to your email."}
          </p>
        </div>

        {/* STEP 1: Request Code */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium"
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? "Sending Instructions..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 2: Verify & Reset */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in-up">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                6-Digit Recovery Code
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                maxLength={6}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-[0.5em] font-mono text-center text-xl font-bold text-gray-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-base placeholder:font-medium"
                placeholder="Check your email"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Confirm New Password"}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}