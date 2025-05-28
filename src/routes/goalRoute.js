const express = require("express");
const router = express.Router();
const { sequelize, Goal } = require("../config/db");
const { Op } = require("sequelize");

// ➕ Add or Update Goal
router.post("/", async (req, res) => {
  try {
    const goal = req.body;
    if (!goal) return res.status(400).json({ message: "Goal verisi eksik." });

    const existingGoal = await Goal.findByPk(goal.ID);

    if (!existingGoal) {
      await Goal.create(goal);
      return res.status(200).json({ message: "Goal eklendi." });
    } else {
      await Goal.update(goal, { where: { ID: goal.ID } });
      return res.status(200).json({ message: "Goal güncellendi." });
    }
  } catch (err) {
    res.status(500).json({ message: "Hata oluştu", error: err.message });
  }
});

// 🗑️ Delete Goal
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Goal.destroy({ where: { ID: id } });

    if (deleted) return res.status(200).json({ message: "Goal silindi." });
    return res.status(404).json({ message: "Goal bulunamadı." });
  } catch (err) {
    res.status(500).json({ message: "Hata oluştu", error: err.message });
  }
});

// 📄 Get All Goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.findAll();
    return res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ message: "Hata oluştu", error: err.message });
  }
});

// 🔍 Get Goal by ID
router.get("/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await Goal.findByPk(id);

    if (!goal) return res.status(404).json({ message: "Goal bulunamadı." });

    return res.status(200).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Hata oluştu", error: err.message });
  }
});

// 📆 Get Total Goal Amount by Date Range (month + year from startDate)
router.get("/dateRange/:userid/:startDate", async (req, res) => {
  try {
    const { userid, startDate } = req.params;
    const parsedDate = new Date(startDate);

    if (isNaN(parsedDate)) {
      return res.status(400).json({ message: "Tarih formatı geçersiz." });
    }

    const goals = await Goal.findAll({
      where: {
        UserId: userid,
        [Op.and]: [
          sequelize.where(sequelize.fn("MONTH", sequelize.col("StartDate")), parsedDate.getMonth() + 1),
          sequelize.where(sequelize.fn("YEAR", sequelize.col("StartDate")), parsedDate.getFullYear()),
        ],
      },
      attributes: ["Amount"],
    });

    const totalAmount = goals.reduce((sum, g) => sum + g.Amount, 0);
    return res.status(200).json({ totalAmount });
  } catch (err) {
    res.status(500).json({ message: "Hata oluştu", error: err.message });
  }
});

module.exports = router;
