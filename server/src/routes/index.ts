import express from 'express';
import voxRoutes from './vox';

const router = express.Router();

// Mount route groups
router.use('/vox', voxRoutes);

export default router;
