const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./src/config/db");
const userRoutes = require("./src/routes/userRoute");
const categoryRoutes = require("./src/routes/categoryRoute");
const incomeExpenseRoute = require("./src/routes/incomeExpenseRoute");
const goalRoute = require("./src/routes/goalRoute"); 
const authRoute = require('./src/routes/authRoute');


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', authRoute);
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/incomeExpenses", incomeExpenseRoute);
app.use("/goals", goalRoute);

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

