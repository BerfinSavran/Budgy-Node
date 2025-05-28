const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { User, Category } = require("../config/db");

const defaultCategories = (userId) => [
    { Name: "Maaş", InExType: 0, UserId: userId },
    { Name: "Freelance", InExType: 0, UserId: userId },
    { Name: "Yatırım", InExType: 0, UserId: userId },
    { Name: "Burs", InExType: 0, UserId: userId },
    { Name: "Kira", InExType: 0, UserId: userId },
    { Name: "Gıda", InExType: 1, UserId: userId },
    { Name: "Ulaşım", InExType: 1, UserId: userId },
    { Name: "Fatura", InExType: 1, UserId: userId },
    { Name: "Eğlence", InExType: 1, UserId: userId },
    { Name: "Sağlık", InExType: 1, UserId: userId },
    { Name: "Eğitim", InExType: 1, UserId: userId },
    { Name: "Alışveriş", InExType: 1, UserId: userId },
    { Name: "Birikim", InExType: 1, UserId: userId },
    { Name: "Kira", InExType: 1, UserId: userId },
    { Name: "Sigorta", InExType: 1, UserId: userId }
];

// Create or update
router.post("/", async (req, res) => {
    try {
        const userData = req.body;

        // Şifreyi hashle
        if (userData.Password) {
            const hashedPassword = await bcrypt.hash(userData.Password, 10);
            userData.Password = hashedPassword;
        }

        // 1. Kullanıcıyı oluştur ve MUTLAKA bekle
        console.log("Kullanıcı oluşturuluyor...");
        const newUser = await User.create(userData);
        
        // 2. User kesinlikle oluşturuldu, ID'sini alalım
        const userId = newUser.ID || newUser.id; // Her iki durumu da dene
        console.log("Kullanıcı oluşturuldu! UserID:", userId);
        
        if (!userId) {
            throw new Error("User ID alınamadı!");
        }

        // 3. Kategorileri hazırla
        const categories = defaultCategories(userId);
        console.log(`${categories.length} kategori hazırlandı, UserID: ${userId}`);
        
        // Her kategorinin userId'sini kontrol et
        categories.forEach((cat, index) => {
            console.log(`Kategori ${index + 1}: ${cat.Name}, UserID: ${cat.UserId}`);
        });

        // 4. Kategorileri oluştur
        console.log("Kategoriler oluşturuluyor...");
        const createdCategories = await Category.bulkCreate(categories);
        console.log(`${createdCategories.length} kategori oluşturuldu!`);

        // 5. Başarılı response döndür
        return res.status(201).json({
            success: true,
            user: newUser,
            categoriesCount: createdCategories.length,
            message: "Kullanıcı ve kategoriler başarıyla oluşturuldu"
        });

    } catch (err) {
        console.error("=== REGISTER HATASI ===");
        console.error("Hata mesajı:", err.message);
        console.error("Stack trace:", err.stack);
        
        res.status(500).json({ 
            success: false,
            message: "Kullanıcı oluşturulurken hata oluştu", 
            error: err.message 
        });
    }
});

// YENİ EKLENEN UPDATE ROUTE
router.put("/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;

        console.log("Kullanıcı güncelleniyor:", userId);
        console.log("Güncellenecek veriler:", updateData);

        // Kullanıcının var olup olmadığını kontrol et
        const existingUser = await User.findByPk(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "Kullanıcı bulunamadı"
            });
        }

        // Şifre güncellenmek isteniyorsa hashle
        if (updateData.Password) {
            const hashedPassword = await bcrypt.hash(updateData.Password, 10);
            updateData.Password = hashedPassword;
        }

        // Kullanıcı bilgilerini güncelle
        const [updatedRowsCount] = await User.update(updateData, {
            where: { ID: userId },
            returning: true // PostgreSQL için, MySQL için kaldırılabilir
        });

        if (updatedRowsCount === 0) {
            return res.status(400).json({
                success: false,
                message: "Kullanıcı güncellenemedi"
            });
        }

        // Güncellenmiş kullanıcıyı getir
        const updatedUser = await User.findByPk(userId);

        console.log("Kullanıcı başarıyla güncellendi");

        return res.status(200).json({
            success: true,
            user: updatedUser,
            message: "Kullanıcı başarıyla güncellendi"
        });

    } catch (err) {
        console.error("=== UPDATE HATASI ===");
        console.error("Hata mesajı:", err.message);
        console.error("Stack trace:", err.stack);
        
        res.status(500).json({ 
            success: false,
            message: "Kullanıcı güncellenirken hata oluştu", 
            error: err.message 
        });
    }
});

// Delete
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { ID: id } });
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
