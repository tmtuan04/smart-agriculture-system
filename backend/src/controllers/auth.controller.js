import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library"

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Gen JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

export const googleLogin = async (req, res) => {

}

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        const token = generateToken(newUser._id);

        res.status(201).json({
            _id: newUser._id,
            email: newUser.email,
            fullName: newUser.fullName,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const token = generateToken(user._id);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            token, // JWT cho mobile lưu trong secure storage
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = async (req, res) => {
    try {
        // Mobile app sẽ có logic xoá token trong secure storage
        res.status(200).json({ message: "Logout Successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
