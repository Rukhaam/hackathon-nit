import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables so we can connect to MySQL
dotenv.config();

const setupDatabase = async () => {
  try {
    console.log("⏳ Connecting to MySQL...");

    // Create a direct connection using your .env credentials
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'libsys', 
    });

    console.log("✅ Connected! Running Migrations...\n");

    // ---------------------------------------------------------
    // 1. CREATE USERS TABLE
    // ---------------------------------------------------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'super-admin') DEFAULT 'user',
        avatar_url LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔️  Users table ready.");

    // ---------------------------------------------------------
    // 2. CREATE BOOKS TABLE
    // ---------------------------------------------------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        quantity INT NOT NULL DEFAULT 1,
        is_available TINYINT(1) NOT NULL DEFAULT 1,
        isbn VARCHAR(50) DEFAULT 'N/A',
        category VARCHAR(100) DEFAULT 'Uncategorized',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔️  Books table ready.");

    // ---------------------------------------------------------
    // 3. CREATE BORROW RECORDS TABLE
    // ---------------------------------------------------------
    await connection.query(`
      CREATE TABLE IF NOT EXISTS borrow_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP NULL DEFAULT NULL,
        fine DECIMAL(10, 2) DEFAULT 0.00,
        fine_status ENUM('Unpaid', 'Paid') DEFAULT 'Unpaid',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
      )
    `);
    console.log("✔️  Borrow Records table ready.");

    // ---------------------------------------------------------
    // 4. SEED DATA (Create Default Admin)
    // ---------------------------------------------------------
    console.log("\n🌱 Running Seeds...");
    
    // Check if an admin already exists to prevent duplicates
    const [existingAdmins] = await connection.query(`SELECT * FROM users WHERE email = 'admin@libsys.com'`);

    if (existingAdmins.length === 0) {
      // Hash the default password ("admin123")
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      await connection.query(`
        INSERT INTO users (name, email, phone, password, role) 
        VALUES ('Super Admin', 'admin@libsys.com', '+1234567890', ?, 'super-admin')
      `, [hashedPassword]);

      console.log("🌟 Master Admin account created successfully!");
      console.log("   Email: admin@libsys.com");
      console.log("   Password: admin123");
    } else {
      console.log("👍 Admin account already exists. Skipping seed.");
    }

    console.log("\n🎉 Database Setup & Migration Complete!");
    process.exit(0); // Exit the script successfully

  } catch (error) {
    console.error("\n❌ Database Setup Failed!");
    console.error(error.message);
    process.exit(1); // Exit with error
  }
};

// Execute the function
setupDatabase();