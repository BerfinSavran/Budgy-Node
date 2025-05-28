const express = require("express");
const {Category} = require("../config/db");
const router = express.Router();
const {EnumInExType} = require("../enums/index");

// Get all
router.get("/", async (req, res) => {
    const categories = await Category.findAll();
    res.status(200).json(categories);
});

// Get by ID
router.get("/id/:id", async (req, res) => {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: "Bulunamadı." });
    res.status(200).json(category);
});

// GET /api/categories/type/:inExType/:userId
router.get("/type/:inExType/:userId", async (req, res) => {
  const inExType = parseInt(req.params.inExType);
  const userId = req.params.userId;

  // Enum kontrolü
  if (!Object.values(EnumInExType).includes(inExType)) {
    return res.status(400).json({
      message: `Invalid type value: ${inExType}. Valid values are: ${Object.values(EnumInExType).join(", ")}`
    });
  }

  try {
    const categories = await Category.findAll({
      where: {
        UserID: userId,
        InExType: inExType
      }
    });

    if (categories.length === 0) {
      return res.status(404).json({ message: "Categories not found." });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;