import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet"; 
import hpp from "hpp"; 

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import apiRoutes from './routes/aiRoutes.js'

import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { startCronJobs } from "./utils/deleteUnverifiedUsers.js";
dotenv.config();

const app = express();
app.set("trust proxy", 1);

// SECURITY MIDDLEWARE WAREHOUSE

// 1. Set Security HTTP Headers
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, 
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 4. Prevent HTTP Parameter Pollution
app.use(hpp());

// STANDARD MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTES
app.use("/api/admin", adminRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/ai",apiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Local Services Booking API is running securely...");
});

app.use(errorMiddleware);
startCronJobs();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running securely on port ${PORT}`);
  });
}

export default app;