import { Router, Request, Response } from 'express';
import { AuthService } from '../../services/auth';

const router = Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, first_name, last_name } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const result = await AuthService.register({
            email,
            password_hash: password, // Service will hash this
            first_name,
            last_name,
            role: 'USER',
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
});

export default router;
