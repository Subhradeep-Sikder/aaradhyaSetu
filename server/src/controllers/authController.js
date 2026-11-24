import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: role || 'user',
            isVerified: true
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
