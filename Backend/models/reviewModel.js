import pool from "../config/db.js";

export const insertReview = async (
  bookingId,
  customerId,
  providerId,
  rating,
  comment
) => {
  const query = `
    INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(query, [
    bookingId,
    customerId,
    providerId,
    rating,
    comment,
  ]);
  return result.insertId;
};

export const getReviewsByProvider = async (providerId) => {
  const query = `
    SELECT r.id, r.rating, r.comment, r.created_at, u.name as customer_name 
    FROM reviews r
    JOIN users u ON r.customer_id = u.id
    WHERE r.provider_id = ?
    ORDER BY r.created_at DESC
  `;
  const [rows] = await pool.query(query, [providerId]);
  return rows;
};

export const getProviderAverageRating = async (providerId) => {
  const query =
    "SELECT AVG(rating) as averageRating, COUNT(*) as totalReviews FROM reviews WHERE provider_id = ?";
  const [rows] = await pool.query(query, [providerId]);
  return rows[0];
};

export const getReviewByBookingId = async (bookingId) => {
  const query = "SELECT * FROM reviews WHERE booking_id = ?";
  const [rows] = await pool.query(query, [bookingId]);
  return rows[0];
};