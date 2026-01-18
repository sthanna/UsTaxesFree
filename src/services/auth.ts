import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, CreateUserDTO, User } from '../repositories/user';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class AuthService {
    static async register(data: CreateUserDTO): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
        const existingUser = await UserRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(data.password_hash, salt);

        const newUser = await UserRepository.create({
            ...data,
            password_hash,
        });

        const token = this.generateToken(newUser);
        const { password_hash: _, ...userWithoutPassword } = newUser;

        return { user: userWithoutPassword, token };
    }

    static async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user);
        const { password_hash: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    private static generateToken(user: User): string {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET
        );
    }
}
