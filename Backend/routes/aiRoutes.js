import express from 'express';
import { generateBio, parseSearchQuery,getFairPriceEstimate} from '../controllers/aiConrollers.js';
import { isAuthenticated, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate-bio', isAuthenticated, authorizeRoles('provider'), generateBio);
router.post('/parse-search',parseSearchQuery);
router.post('/fair-price', getFairPriceEstimate);


export default router;