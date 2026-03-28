import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUserAPI, verifyOtpAPI } from "../../api/authApi";
import { setCredentials } from "../../redux/slices/authSlice";
import { useToast } from "../../hooks/toastHook";

export default function Register() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [otp, setOtp] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 🌟 Ensure we have showSuccess and showError
  const { showSuccess, showError } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await registerUserAPI(formData);
      // 🌟 Trigger a success popup so the user knows to check their email
      showSuccess("Verification code sent to your email!"); 
      setStep(2);
    } catch (err) {
      // 🌟 FIX: Actually call the showError popup instead of silently setting state
      showError(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await verifyOtpAPI({ email: formData.email, otp });
      dispatch(setCredentials(response.user));

      showSuccess(`Welcome back, ${response.user.name}!`);
      const safeRole = response.user.role.toLowerCase().trim();
      if (safeRole === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err) {
      // This one was already correct, but now it matches Step 1!
      showError(err.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* ========================================== */}
        {/* LEFT PANEL (Registration Form)             */}
        {/* ========================================== */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {step === 1 ? "Create an Account" : "Check Your Inbox"}
            </h2>
            <p className="text-gray-500 mb-8">
              {step === 1
                ? "Join LocalHub to book or provide services."
                : `We sent a 6-digit security code to ${formData.email}`}
            </p>

            {step === 1 && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
            
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="Minimum 6 characters"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How will you use LocalHub?
                  </label>
                  <ul className="grid w-full gap-4 md:grid-cols-2">
                    {/* CUSTOMER OPTION */}
                    <li>
                      <input
                        type="radio"
                        id="role-customer"
                        name="role"
                        value="customer"
                        className="hidden peer"
                        checked={formData.role === "customer"}
                        onChange={handleChange}
                        required
                      />
                      <label
                        htmlFor="role-customer"
                        className="inline-flex items-center justify-between w-full p-4 text-gray-500 bg-white border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-700 peer-checked:bg-blue-50 hover:text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <div className="block">
                          <div className="w-full text-sm font-bold">
                            Hire Pros
                          </div>
                          <div className="w-full text-xs mt-1 text-gray-500">
                            I need services done
                          </div>
                        </div>
                        {/* Checkmark Icon (Only shows when selected) */}
                        <svg
                          className={`w-5 h-5 ${
                            formData.role === "customer"
                              ? "text-blue-600"
                              : "hidden"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </label>
                    </li>

                    {/* PROVIDER OPTION */}
                    <li>
                      <input
                        type="radio"
                        id="role-provider"
                        name="role"
                        value="provider"
                        className="hidden peer"
                        checked={formData.role === "provider"}
                        onChange={handleChange}
                        required
                      />
                      <label
                        htmlFor="role-provider"
                        className="inline-flex items-center justify-between w-full p-4 text-gray-500 bg-white border-2 border-gray-200 rounded-xl cursor-pointer peer-checked:border-blue-600 peer-checked:text-blue-700 peer-checked:bg-blue-50 hover:text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <div className="block">
                          <div className="w-full text-sm font-bold">
                            Offer Services
                          </div>
                          <div className="w-full text-xs mt-1 text-gray-500">
                            I am a professional
                          </div>
                        </div>
                        {/* Checkmark Icon (Only shows when selected) */}
                        <svg
                          className={`w-5 h-5 ${
                            formData.role === "provider"
                              ? "text-blue-600"
                              : "hidden"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </label>
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 mt-4 shadow-md hover:shadow-lg"
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength="6"
                    className="w-full px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="------"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || otp.length < 6}
                    className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-70 shadow-md hover:shadow-lg"
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors py-2"
                  >
                    Wait, I need to change my email
                  </button>
                </div>
              </form>
            )}

            <p className="mt-8 text-center text-sm text-gray-600 md:hidden">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT PANEL (CTA to Login - Desktop Only)  */}
        {/* ========================================== */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-bl from-blue-900 via-blue-800 to-blue-600 p-12 flex-col justify-center items-center text-center text-white relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              className="absolute top-20 right-[-20%] w-64 h-64 fill-current"
            >
              <polygon points="50,0 100,100 0,100" />
            </svg>
            <svg
              viewBox="0 0 100 100"
              className="absolute bottom-10 left-10 w-32 h-32 fill-current"
            >
              <polygon points="50,0 100,100 0,100" />
            </svg>
          </div>

          <h2 className="text-4xl font-extrabold mb-6 relative z-10">
            Already a Member?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-sm leading-relaxed relative z-10">
            Welcome back! Log in to your account to manage your bookings,
            messages, and profile.
          </p>
          <Link
            to="/login"
            className="relative z-10 border-2 border-white text-white font-bold py-3 px-10 rounded-full hover:bg-white hover:text-blue-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
}