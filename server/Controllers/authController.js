// server/Controllers/authController.js
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// 1) USER REGISTRATION
export const register = async (req, res)=>{
    try {
        const { username, email, password, role, photo } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                status: "failed", 
                success: "false", 
                message: "Username, email, and password are required."
            });
        }

        // Hashing password
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        // Check database connection state (1 = connected)
        const isDbConnected = mongoose.connection.readyState === 1;

        if (!isDbConnected) {
            console.log("⚠️ MongoDB is offline/blocked. Using in-memory mock registration fallback.");
            
            // Initialize global mock list
            global.mockUsers = global.mockUsers || [];
            
            // Check duplicate email
            const emailExists = global.mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
            const usernameExists = global.mockUsers.some(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (emailExists || usernameExists) {
                return res.status(400).json({
                    status: "failed",
                    success: "false",
                    message: "User with this email or username already exists in Offline Demo Mode!"
                });
            }

            const mockUser = {
                _id: "mock_user_" + Date.now(),
                username,
                email: email.toLowerCase(),
                password: hash,
                role: role ? role : "user",
                photo: photo || "",
                createdAt: new Date().toISOString()
            };

            global.mockUsers.push(mockUser);
            
            return res.status(201).json({
                status: "success", 
                success: "true", 
                message: "User Registered Successfully in Offline Demo Mode!", 
                data: {
                    _id: mockUser._id,
                    username: mockUser.username,
                    email: mockUser.email,
                    role: mockUser.role,
                    photo: mockUser.photo
                }
            });
        }

        // Standard MongoDB flow
        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({
                status: "failed",
                success: "false",
                message: "Email or Username already registered."
            });
        }

        const newUser = new User({
            username,
            email,  
            password: hash,
            role: role ? role : "user",
            photo: photo
        })

        const registerUser = await newUser.save()
        
        // Remove password from response
        const { password: _, ...userData } = registerUser._doc;

        return res.status(201).json({
            status: "success", 
            success: "true", 
            message: "User Successfully Registered", 
            data: userData
        })

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            status: "failed", 
            success: "false", 
            message: "Registration failed. Database error."
        })
    }
}

// 2) USER LOGIN
export const login = async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;

    try {
        if (!email || !password) {
            return res.status(400).json({
                status: "failed",
                success: "false",
                message: "Email and password are required."
            });
        }

        const isDbConnected = mongoose.connection.readyState === 1;

        if (!isDbConnected) {
            console.log("⚠️ MongoDB is offline/blocked. Using in-memory mock login fallback.");
            global.mockUsers = global.mockUsers || [];

            // Attempt to find user in registration list
            let user = global.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

            // Pre-seed convenient Demo Credentials if they don't exist
            if (!user && email.toLowerCase() === "admin@evenza.com") {
                const salt = bcrypt.genSaltSync(10)
                const hash = bcrypt.hashSync("admin123", salt)
                user = {
                    _id: "mock_admin_default",
                    username: "Demo Admin",
                    email: "admin@evenza.com",
                    password: hash,
                    role: "admin",
                    photo: ""
                };
                global.mockUsers.push(user);
            } else if (!user && email.toLowerCase() === "user@evenza.com") {
                const salt = bcrypt.genSaltSync(10)
                const hash = bcrypt.hashSync("user123", salt)
                user = {
                    _id: "mock_user_default",
                    username: "Demo User",
                    email: "user@evenza.com",
                    password: hash,
                    role: "user",
                    photo: ""
                };
                global.mockUsers.push(user);
            }

            if (!user) {
                return res.status(404).json({
                    status: "failed", 
                    success: "false", 
                    message: "User Not Found. Register first or use: user@evenza.com / user123"
                });
            }

            const checkPassword = await bcrypt.compare(password, user.password)
            if (!checkPassword) {
                return res.status(401).json({
                    status: "failed", 
                    success: "false", 
                    message: "Incorrect Email or Password"
                });
            }

            // Create jwt token
            const token = jwt.sign(
                { id: user._id, role: user.role }, 
                process.env.JWT_SECRET_KEY || "polo22", 
                { expiresIn: "15d" }
            );
            
            return res.cookie('accessToken', token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                expiresIn: 15 * 24 * 60 * 60 * 1000 // 15 days
            }).status(200).json({
                status: "success", 
                success: "true", 
                message: "Logged in via Offline Demo Mode!", 
                token, 
                data: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    photo: user.photo
                }, 
                role: user.role
            });
        }

        // Standard MongoDB flow
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(404).json({
                status: "failed", 
                success: "false", 
                message: "User Not Found"
            })
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) {
            return res.status(401).json({
                status: "failed", 
                success: "false", 
                message: "Incorrect Email or Password"
            })
        }

        const { password: _, role, ...rest } = user._doc

        // Creating jwt token
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET_KEY, 
            { expiresIn: "15d" }
        )
        
        // Setting token in cookies
        return res.cookie('accessToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expiresIn: 15 * 24 * 60 * 60 * 1000 // 15 days
        }).status(200).json({
            status: "success", 
            success: "true", 
            message: "Login Successful", 
            token, 
            data: { ...rest }, 
            role
        }) 

    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            status: "failed", 
            success: "false", 
            message: "Failed to Login"
        })
    }
}
