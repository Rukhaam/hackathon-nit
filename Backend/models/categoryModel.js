import pool from "../config/db.js";

export const insertCategory = async (name, description) => {
  const query = "INSERT INTO categories (name, description) VALUES (?, ?)";
  const [result] = await pool.query(query, [name, description]);
  return result.insertId;
};

export const fetchAllCategories = async () => {
  const query = "SELECT * FROM categories ORDER BY created_at DESC";
  const [rows] = await pool.query(query);
  return rows;
};

  export   const fetchCategoryById = async (id) => {
  const query = "SELECT * FROM categories WHERE id = ?";
  const [rows] = await pool.query(query, [id]);
  return rows[0];
};

export const updateCategoryInDB = async (id, name, description) => {
  const query = "UPDATE categories SET name = ?, description = ? WHERE id = ?";
  await pool.query(query, [name, description, id]);
};

export const deleteCategoryFromDB = async (id) => {
  const query = "DELETE FROM categories WHERE id = ?";
  await pool.query(query, [id]);
};