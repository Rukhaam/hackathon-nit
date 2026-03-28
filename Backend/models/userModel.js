import pool from "../config/db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const createUser = async (name, email, hashedPassword, role) => {
  const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
  const [result] = await pool.query(query, [name, email, hashedPassword, role]);
  return result;
};

export const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const getResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  return { resetToken, hashedToken };
};

export const getUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  const [rows] = await pool.query(query, [email]);
  return rows[0];
};

export const updateUserOTP = async (email, otp, otpExpires) => {
  const query = "UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?";
  await pool.query(query, [otp, otpExpires, email]);
};

export const clearUserOTP = async (email) => {
  const query =
    "UPDATE users SET otp = NULL, otp_expires = NULL, is_verified = TRUE WHERE email = ?";
  await pool.query(query, [email]);
};

export const updatePasswordInDB = async (id, newHashedPassword) => {
  const query = "UPDATE users SET password = ? WHERE id = ?";
  await pool.query(query, [newHashedPassword, id]);
};

export const getUserById = async (id) => {
  const query = "SELECT * FROM users WHERE id = ?";
  const [rows] = await pool.query(query, [id]);
  return rows[0];
};

export const deleteOldUnverifiedUsers = async () => {
  const query = `
    DELETE FROM users 
    WHERE is_verified = 0 AND created_at < (NOW() - INTERVAL 1 DAY)
  `;
  const [result] = await pool.query(query);
  return result;
};