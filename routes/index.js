require('dotenv').config();
const express = require('express');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const router = express.Router();
const bcrypt = require('bcrypt')
const imagekit = require('../libs/imagekit');
const { avatar } = require('../libs/multer');

// register endpoint
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password,10)
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword
            }
        });
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// endpoint update profile
router.put('/users/:id/profile', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, address, occupation } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                firstName,
                lastName,
                email,
                address,
                occupation
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// update avatar
router.put('/users/:id/avatar', avatar.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    const { id } = req.params;
    try {
        const file = req.file;
        const uploadResponse = await imagekit.upload({
            file: file.buffer, 
            fileName: `avatar_${id}`
        });

        // Simpan URL avatar di database
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { avatarUrl: uploadResponse.url }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get all users
router.get('/users', async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany(); 
        res.json(allUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;