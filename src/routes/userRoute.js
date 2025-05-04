const express = require("express");
const router = express.Router();
const { User, Category } = require("../config/db");

const EnumInExType = {
    Income: "Income",
    Expense: "Expense"
};

const EnumGender = {
    0: "Male",
    1: "Female"
};

const defaultCategories = (userId) => [
    { Name: "Maaş", InExType: 0, userId: userId },
    { Name: "Freelance", InExType: 0, userId: userId },
    { Name: "Yatırım", InExType: 0, userId: userId },
    { Name: "Burs", InExType: 0, userId: userId },
    { Name: "Kira", InExType: 0, userId: userId },
    { Name: "Gıda", InExType: 1, userId: userId },
    { Name: "Ulaşım", InExType: 1, userId: userId },
    { Name: "Fatura", InExType: 1, userId: userId },
    { Name: "Eğlence", InExType: 1, userId: userId },
    { Name: "Sağlık", InExType: 1, userId: userId },
    { Name: "Eğitim", InExType: 1, userId: userId },
    { Name: "Alışveriş", InExType: 1, userId: userId },
    { Name: "Birikim", InExType: 1, userId: userId },
    { Name: "Kira", InExType: 1, userId: userId },
    { Name: "Sigorta", InExType: 1, userId: userId }
];

// Create or update
router.post("/", async (req, res) => {
    try {
        const userData = req.body;

        let user = await User.findByPk(userData.id);

        if (!user) {
            userData.Password = userData.Password;
            const newUser = await User.create(userData);

            const categories = defaultCategories(newUser.id);
            await Category.bulkCreate(categories);

            return res.status(201).json(newUser);
        } else {
            await user.update({
                FullName: userData.FullName,
                Email: userData.Email,
                Gender: userData.Gender,
                TelNo: userData.TelNo
            });

            return res.status(200).json(user);
        }
    } catch (err) {
        console.error("Hata:", err);
        res.status(500).json({ message: "Bir hata oluştu." });
    }
});

// Delete
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { ID:id } });
    if (deleted) return res.status(200).json({ message: "Silindi." });
    res.status(404).json({ message: "Bulunamadı." });
});

// Get all
router.get("/", async (req, res) => {
    const users = await User.findAll();
    res.status(200).json(users);
});

// Get by ID
router.get("/id/:id", async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Bulunamadı." });
    res.status(200).json(user);
});

// Get by Email
router.get("/email/:email", async (req, res) => {
    const user = await User.findOne({ where: { Email: req.params.email } });
    if (!user) return res.status(404).json({ message: "Bulunamadı." });
    res.status(200).json(user);
});

module.exports = router;
