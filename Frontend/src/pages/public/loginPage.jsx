import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUserAPI } from "../../api/authApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { useToast } from "../../hooks/toastHook";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await loginUserAPI({ email, password });
      dispatch(setCredentials(response.user));
      showSuccess(`Welcome back, ${response.user.name}!`);
      const safeRole = response.user.role.toLowerCase().trim();
      if (safeRole === "admin") {
        navigate("/admin/dashboard");
      } else if (safeRole === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* LEFT PANEL (CTA to Register - Desktop Only)*/}

        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-12 flex-col justify-center items-center text-center text-white relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              className="absolute -top-10 -left-10 w-64 h-64 fill-current"
            >
              <circle cx="50" cy="50" r="50" />
            </svg>
            <svg
              viewBox="0 0 100 100"
              className="absolute bottom-10 right-10 w-40 h-40 fill-current"
            >
              <circle cx="50" cy="50" r="50" />
            </svg>
          </div>

          <h2 className="text-4xl font-extrabold mb-6 relative z-10">
            New Here?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-sm leading-relaxed relative z-10">
            Sign up today to discover a world of top-rated local professionals
            right at your fingertips.
          </p>
          <Link
            to="/register"
            className="relative z-10 border-2 border-white text-white font-bold py-3 px-10 rounded-full hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            Create an Account
          </Link>
        </div>

        {/* RIGHT PANEL (Login Form)                   */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-8">
              Please enter your details to sign in.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[0.6em] font-semibold text-blue-600 hover:text-blue-800 transition-colors md:text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-md hover:shadow-lg"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 md:hidden">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
