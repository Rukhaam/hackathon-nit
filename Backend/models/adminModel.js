import db from "../config/db.js"; 
import pool from "../config/db.js";

class AdminModel {
  static async getAllUsers() {
    const query = `
      SELECT id, name, email, role, created_at, is_suspended 
      FROM users 
      ORDER BY created_at DESC
    `;
    const [users] = await db.query(query);
    return users;
  }

  static async getAllBookings() {
    const query = `
      SELECT b.*, 
             customer.name AS customer_name, 
             provider.name AS provider_name
      FROM bookings b
      LEFT JOIN users customer ON b.customer_id = customer.id
      LEFT JOIN users provider ON b.provider_id = provider.id
      ORDER BY b.created_at DESC
    `;
    const [bookings] = await db.query(query);
    return bookings;
  }
}

export const updateUserSuspensionStatusInDB = async (userId, isSuspended) => {
  // 🌟 FIX 2: Changed this back to an UPDATE statement!
  const query = "UPDATE users SET is_suspended = ? WHERE id = ?";
  const statusValue = isSuspended ? 1 : 0; 
  
  const [result] = await pool.query(query, [statusValue, userId]);
  return result;
};

export default AdminModel;