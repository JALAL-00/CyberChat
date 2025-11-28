const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const validateInput = (firstName, lastName, email, password) => {
    if (!firstName || !lastName || !email || !password) {
        return 'Please fill in all fields.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address.';
    }

    // UPDATED PASSWORD REGEX AND MESSAGE
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s])[A-Za-z\d\W\s]{8,}$/;
    if (password.length < 8 || !passwordRegex.test(password)) {
        return 'Password must be at least 8 characters, including uppercase, lowercase, number, and special character.';
    }

    return null;
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const validationError = validateInput(firstName, lastName, email, password);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password.' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

module.exports = { registerUser, loginUser };