import pool from "../config/db.js";

// 1. Create a new profile
export const insertProviderProfile = async (userId, categoryId, bio, serviceArea, basePrice) => {
  const query =
    "INSERT INTO provider_profiles (user_id, category_id, bio, service_area, base_price) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.query(query, [userId, categoryId, bio, serviceArea, basePrice]);
  return result.insertId;
};

export const getProviderByUserId = async (userId) => {
  const query = "SELECT * FROM provider_profiles WHERE user_id = ?";
  const [rows] = await pool.query(query, [userId]);
  return rows[0];
};

// 3. Update bio and category
export const updateProviderProfileInDB = async (userId, categoryId, bio, serviceArea, basePrice) => {
  const query =
    "UPDATE provider_profiles SET category_id = ?, bio = ?, service_area = ?, base_price = ? WHERE user_id = ?";
  await pool.query(query, [categoryId, bio, serviceArea, basePrice, userId]);
};

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
  // 1. Build the base conditions that BOTH queries will share
  let baseQuery = `
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON p.user_id = r.provider_id 
    WHERE p.is_approved = TRUE AND p.is_available = TRUE
  `;

  const params = [];
  
  // Apply Category Filter dynamically
  if (categoryId) {
    baseQuery += " AND p.category_id = ?";
    params.push(categoryId);
  }
  
  // Apply Area Filter dynamically
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
      COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
      COUNT(r.id) AS total_reviews
    ${baseQuery}
    GROUP BY p.id, p.user_id, p.category_id, u.name, u.email, c.name, p.bio, p.base_price, p.service_area
    ORDER BY average_rating DESC, p.id DESC
    LIMIT ? OFFSET ?
  `;

  // 3. Build the specific Count Query (calculates total pages)
  const countQuery = `
    SELECT COUNT(DISTINCT p.id) as totalCount
    ${baseQuery}
  `;

  // 4. Execute both simultaneously
  const [[providers], [countResult]] = await Promise.all([
    pool.query(dataQuery, [...params, Number(limit), Number(offset)]),
    pool.query(countQuery, params)
  ]);

  return {
    providers,
    totalCount: countResult[0].totalCount
  };
};

export const getAllProvidersDB = async () => {
  const query = `
    SELECT 
      p.id as profile_id, 
      u.name, 
      u.email, 
      p.bio, 
      p.is_approved, 
      p.is_available 
    FROM provider_profiles p
    JOIN users u ON p.user_id = u.id
  `;
  const [rows] = await pool.query(query);
  return rows;
};