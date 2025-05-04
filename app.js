const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./src/config/db");
const userRoutes = require("./src/routes/userRoute");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/users", userRoutes);


db.sequelize.sync()
    .then(() => {
        console.log("✅ Veritabanı senkronize edildi.");

        // Sunucuyu başlat
        app.listen(3000, () => {
            console.log("🚀 Sunucu 3000 portunda çalışıyor...");
        });
    })
    .catch(err => {
        console.error("❌ Veritabanı senkronizasyon hatası:", err);
        process.exit(1);
    });

