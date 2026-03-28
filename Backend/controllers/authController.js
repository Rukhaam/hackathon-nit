import bcrypt from "bcryptjs";
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserOTP,
  clearUserOTP,
  updatePasswordInDB,
  generateToken,
  generateVerificationCode,
} from "../models/userModel.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrorMiddleware.js";
import { ErrorHandler } from "../middlewares/errorMiddleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  verificationEmailTemplate,
  passwordResetTemplate,
} from "../utils/emailtemplate.js";

const getCookieOptions = () => ({
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

// 1. REGISTER USER
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const userExists = await getUserByEmail(email);
  if (userExists) {
    return next(new ErrorHandler("User already exists", 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userRole =
    role && ["customer", "provider", "admin"].includes(role)
      ? role
      : "customer";

  await createUser(name, email, hashedPassword, userRole);

  const otp = generateVerificationCode();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

  await updateUserOTP(email, otp, otpExpires);

  const message = verificationEmailTemplate(name, otp);

  try {
    await sendEmail({ email, subject: "Verify your Account", message });

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("🚨 EMAIL ERROR:", error);
    await clearUserOTP(email);
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

// 2. VERIFY REGISTRATION OTP
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await getUserByEmail(email);
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.otp !== otp || new Date(user.otp_expires) < new Date()) {
    return next(new ErrorHandler("Invalid or expired verification code", 400));
  }

  await clearUserOTP(email);
  const token = generateToken(user);

  res
  .status(200)
  .cookie("token", token, getCookieOptions())
  .json({
    success: true,
    message: "Login successful",
    token: token, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_suspended: user.is_suspended, 
    },
  });
});

// 3. LOGIN USER
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  if (user.is_suspended) {
    return next(new ErrorHandler("Your account has been suspended by the Admin. Please contact support.", 403));
  }

  if (!user.is_verified)
    return next(new ErrorHandler("Please verify your email first", 401));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ErrorHandler("Invalid email or password", 401));

  const token = generateToken(user);

  res
  .status(200)
  .cookie("token", token, getCookieOptions()) 
  .json({
    success: true,
    message: "Login successful",
    token: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_suspended: user.is_suspended, 
    },
  });
});
// 4. FORGOT PASSWORD
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);

  if (!user) return next(new ErrorHandler("User not found", 404));

  const otp = generateVerificationCode();
  const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await updateUserOTP(email, otp, otpExpires);

  const message = passwordResetTemplate(user.name, otp);

  try {
    await sendEmail({ email, subject: "Password Reset Code", message });
    res
      .status(200)
      .json({ success: true, message: "Reset code sent to your email." });
  } catch (error) {
    console.error("🚨 EMAIL ERROR:", error);
    await clearUserOTP(email);
    return next(new ErrorHandler("Email could not be sent", 500));
  }
});

// 5. RESET PASSWORD
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email, token, newPassword } = req.body;
  const user = await getUserByEmail(email);

  if (!user) return next(new ErrorHandler("User not found", 404));

  if (user.otp !== token || new Date(user.otp_expires) < new Date()) {
    return next(new ErrorHandler("Invalid or expired reset code", 400));
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  await updatePasswordInDB(user.id, hashedPassword);
  await clearUserOTP(email);

  res.status(200).json({
    success: true,
    message: "Password reset successfully. You can now log in.",
  });
});

// 6. UPDATE PASSWORD (Logged In)
export const updatePasswordLoggedIn = catchAsyncErrors(
  async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const user = await getUserById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return next(new ErrorHandler("Old password is incorrect", 400));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await updatePasswordInDB(user.id, hashedPassword);

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  }
);

// GET CURRENT USER
export const getMe = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// 7. LOGOUT
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});
