import { Router } from 'express';
import { signup, login, me } from '../controllers/auth.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, me);

export default router;
