const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { User } = require('../config/db');  // models/index.js içinde User export edilmiş olmalı

const JWT_SECRET = "seningizligizliAnahtar123!"; // Bunu .env dosyasına taşıyabilirsin

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Email ile kullanıcıyı bul
        const user = await User.findOne({ where: { Email: email } });
        if (!user) {
            return res.status(401).json({ message: "Kullanıcı bulunamadı" });
        }

        // Şifre kontrolü (parola boş olabilir, izin veriyorsan kontrolü ona göre ayarla)
        if (!user.Password) {
            return res.status(401).json({ message: "Parola tanımlı değil" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Şifre yanlış" });
        }

        // Token üret
        const token = jwt.sign(
            { id: user.ID, email: user.Email, fullName: user.FullName },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            token,
            user: {
                ID: user.ID,
                FullName: user.FullName,
                Email: user.Email,
                Gender: user.Gender,
                TelNo: user.TelNo,
            }
        });

    } catch (error) {
        console.error("Login Hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası" });
    }
});

module.exports = router;
