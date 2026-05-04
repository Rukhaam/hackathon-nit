import pool from "../config/db.js";

// 1. Create a new profile
export const insertProviderProfile = async (userId, categoryId, bio, serviceArea, basePrice) => {
  const query =
    "INSERT INTO provider_profiles (user_id, category_id, bio, service_area, base_price) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.query(query, [userId, categoryId, bio, serviceArea, basePrice]);
  return result.insertId;
};

// 2. Get Single Provider
export const getProviderByUserId = async (userId) => {
  const query = "SELECT * FROM provider_profiles WHERE user_id = ?";
  const [rows] = await pool.query(query, [userId]);
  return rows[0];
};

// 3. Update Profile (DYNAMIC: Handles optional Image & PDF uploads)
// Replace your old updateProviderProfileInDB with this one:

export const updateProviderProfileInDB = async (userId, updateData) => {
  const fields = [];
  const values = [];

  // Dynamically build the SET clause based on what was passed from the controller
  if (updateData.category_id !== undefined) { 
    fields.push("category_id = ?"); 
    values.push(updateData.category_id); 
  }
  if (updateData.bio !== undefined) { 
    fields.push("bio = ?"); 
    values.push(updateData.bio); 
  }
  if (updateData.service_area !== undefined) { 
    fields.push("service_area = ?"); 
    values.push(updateData.service_area); 
  }
  if (updateData.base_price !== undefined) { 
    fields.push("base_price = ?"); 
    values.push(updateData.base_price); 
  }
  
  // These handle the new file uploads
  if (updateData.profile_image !== undefined) { 
    fields.push("profile_image = ?"); 
    values.push(updateData.profile_image); 
  }
  if (updateData.document_url !== undefined) { 
    fields.push("document_url = ?"); 
    values.push(updateData.document_url); 
  }
  if (updateData.is_approved !== undefined) { 
    fields.push("is_approved = ?"); 
    values.push(updateData.is_approved); 
  }

  if (fields.length === 0) return; // Nothing to update

  const query = `UPDATE provider_profiles SET ${fields.join(", ")} WHERE user_id = ?`;
  values.push(userId);

  await pool.query(query, values);
};

// 4. Toggle Availability
export const toggleAvailabilityInDB = async (userId, isAvailable) => {
  const query =
    "UPDATE provider_profiles SET is_available = ? WHERE user_id = ?";
  await pool.query(query, [isAvailable, userId]);
};

// 5. Approve Provider (For the Admin)
export const approveProviderInDB = async (profileId, isApproved) => {
  const query = "UPDATE provider_profiles SET is_approved = ? WHERE id = ?";
  await pool.query(query, [isApproved, profileId]);
};

// 6. Fetch all approved & available providers (WITH DYNAMIC FILTERS & PAGINATION)
export const getAllApprovedProviders = async (categoryId = null, serviceArea = null, limit = 9, offset = 0) => {
  let baseQuery = `
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.user_id = r.provider_id 
    WHERE p.is_approved = TRUE AND p.is_available = TRUE
  `;

  const params = [];
  
  if (categoryId) {
    baseQuery += " AND p.category_id = ?";
    params.push(categoryId);
  }
  
  if (serviceArea) {
    baseQuery += " AND LOWER(p.service_area) LIKE LOWER(?)";
    params.push(`%${serviceArea}%`);
  }

  const dataQuery = `
    SELECT 
      p.id as profile_id, 
      p.user_id,             
      p.category_id,        
      u.name, 
      u.email, 
      c.name as category_name, 
      p.bio,
      p.base_price,
      p.service_area,
      p.profile_image, -- ADDED THIS FOR FRONTEND AVATARS
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.id) AS total_reviews
    ${baseQuery}
    GROUP BY p.id, p.user_id, p.category_id, u.name, u.email, c.name, p.bio, p.base_price, p.service_area, p.profile_image
    ORDER BY average_rating DESC, p.id DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as totalCount
    ${baseQuery}
  `;

  const [[providers], [countResult]] = await Promise.all([
    pool.query(dataQuery, [...params, Number(limit), Number(offset)]),
    pool.query(countQuery, params)
  ]);

  return {
    providers,
    totalCount: countResult[0].totalCount
  };
};

// 7. Fetch All Providers for Admin Panel
export const getAllProvidersDB = async () => {
  // Added profile_image, document_url, and category name for the Admin Dashboard
  const query = `
    SELECT 
      p.id as profile_id, 
      u.name, 
      u.email, 
      p.bio, 
      p.is_approved, 
      p.is_available,
      p.profile_image,
      p.document_url,
      c.name as category_name
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
  `;
  const [rows] = await pool.query(query);
  return rows;
};