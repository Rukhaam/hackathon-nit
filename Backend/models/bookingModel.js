import pool from "../config/db.js";

export const insertBooking = async (
  customerId,
  providerId,
  categoryId,
  phoneNumber, 
  address,
  scheduledDate,
  notes,
  price 
) => {
  const query = `
    INSERT INTO bookings (customer_id, provider_id, category_id, phone_number, address, scheduled_date, notes, status, price) 
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Requested', ?)
  `;
  const [result] = await pool.query(query, [
    customerId,
    providerId,
    categoryId,
    phoneNumber, 
    address,
    scheduledDate,
    notes,
    price 
  ]);
  return result.insertId;
};

// 2. Get a booking by ID
export const getBookingById = async (bookingId) => {
  const query = "SELECT * FROM bookings WHERE id = ?";
  const [rows] = await pool.query(query, [bookingId]);
  return rows[0];
};

// 3. Update Status
export const updateBookingStatusInDB = async (bookingId, status) => {
  const query = "UPDATE bookings SET status = ? WHERE id = ?";
  await pool.query(query, [status, bookingId]);
};

// 4. Complete Job (With Images)
export const completeBookingInDB = async (
  bookingId,
  beforeImageUrl,
  afterImageUrl
) => {
  const query =
    "UPDATE bookings SET status = 'Completed', before_image_url = ?, after_image_url = ? WHERE id = ?";
  await pool.query(query, [beforeImageUrl, afterImageUrl, bookingId]);
};

export const getUserBookings = async (userId, role) => {
  const column = role === "provider" ? "provider_id" : "customer_id";

  const query = `
    SELECT b.*, 
           c.name as category_name, 
           cust.name as customer_name, 
           prov.name as provider_name
    FROM bookings b
    JOIN categories c ON b.category_id = c.id
    JOIN users cust ON b.customer_id = cust.id
    JOIN users prov ON b.provider_id = prov.id
    WHERE b.${column} = ?
    ORDER BY b.scheduled_date DESC
  `;

  const [rows] = await pool.query(query, [userId]);
  return rows;
};

export const updateBookingDateInDB = async (bookingId, newDate) => {
  const query = "UPDATE bookings SET scheduled_date = ? WHERE id = ?";
  await pool.query(query, [newDate, bookingId]);
};

export const updateBookingPriceInDB = async (bookingId, newPrice) => {
  const query = "UPDATE bookings SET price = ? WHERE id = ?";
  await pool.query(query, [newPrice, bookingId]);
};