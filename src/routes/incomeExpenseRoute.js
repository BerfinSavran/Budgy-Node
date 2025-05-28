const express = require("express");
const router = express.Router();
const { IncomeExpense, Category } = require("../config/db");
const { EnumInExType } = require("../enums/index");
const { Op } = require("sequelize");

// Aylık kategori toplamlarını güncelleme fonksiyonu
async function updateMonthlyCategoryTotals(month, year, inExType) {
    const incomeExpenses = await IncomeExpense.findAll({
        where: {
            InExType: inExType,
            Date: {
                [Op.and]: [
                    { [Op.gte]: new Date(year, month - 1, 1) },
                    { [Op.lt]: new Date(year, month, 1) },
                ],
            },
        },
    });

    const categoryTotalsMap = incomeExpenses.reduce((acc, ie) => {
        const key = `${ie.CategoryId}_${ie.InExType}`;
        acc[key] = (acc[key] || 0) + ie.Amount;
        return acc;
    }, {});

    const updatePromises = Object.entries(categoryTotalsMap).map(
        async ([key, totalAmount]) => {
            const [categoryId, inExTypeStr] = key.split("_");
            const category = await Category.findOne({
                where: { ID: categoryId, InExType: Number(inExTypeStr) },
            });
            if (category) {
                category.TotalAmount = totalAmount;
                return category.save();
            }
        }
    );

    const results = await Promise.all(updatePromises);
    return results.length > 0;
}

router.post("/", async (req, res) => {
    try {
        const incomeExpense = req.body;

        if (!incomeExpense) {
            return res
                .status(400)
                .json({ error: "IncomeExpense data is required." });
        }

        const today = new Date();
        const incomeDate = new Date(incomeExpense.Date);

        if (incomeDate > today) {
            return res.status(400).json({
                error: "Future dates are not allowed for income or expenses.",
            });
        }

        const validCategory = await Category.findOne({
            where: {
                ID: incomeExpense.CategoryId,
                InExType: incomeExpense.InExType,
            },
        });

        if (!validCategory) {
            return res.status(400).json({
                error: "The specified category and type combination does not exist.",
            });
        }

        let existingInEx = null;
        if (incomeExpense.ID) {
            existingInEx = await IncomeExpense.findByPk(incomeExpense.ID);
        }

        if (!existingInEx) {
            // Yeni kayıt ekle
            const created = await IncomeExpense.create({
                UserId: incomeExpense.UserId,
                CategoryId: incomeExpense.CategoryId,
                Amount: incomeExpense.Amount,
                InExType: incomeExpense.InExType,
                Description: incomeExpense.Description,
                Date: incomeExpense.Date,
            });

            if (created) {
                await updateMonthlyCategoryTotals(
                    incomeDate.getMonth() + 1,
                    incomeDate.getFullYear(),
                    incomeExpense.InExType
                );
                return res.status(201).json({ success: true, data: created });
            } else {
                return res
                    .status(500)
                    .json({ error: "Failed to add income or expense." });
            }
        } else {
            // Var olan kaydı güncelle
            existingInEx.Description = incomeExpense.Description;
            existingInEx.Date = incomeExpense.Date;
            existingInEx.Amount = incomeExpense.Amount;
            existingInEx.InExType = incomeExpense.InExType;
            existingInEx.CategoryId = incomeExpense.CategoryId;
            existingInEx.UserId = incomeExpense.UserId;

            const updated = await existingInEx.save();

            if (updated) {
                await updateMonthlyCategoryTotals(
                    incomeDate.getMonth() + 1,
                    incomeDate.getFullYear(),
                    incomeExpense.InExType
                );
                return res.status(200).json({ success: true, data: updated });
            } else {
                return res
                    .status(500)
                    .json({ error: "Failed to update income or expense." });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

// Yeni endpoint: MonthlyUpdate - Aylık kategori toplamlarını güncelle
router.post("/MonthlyUpdate", async (req, res) => {
    try {
        const { month, year, inExType } = req.body;

        if (
            typeof month !== "number" ||
            typeof year !== "number" ||
            typeof inExType !== "number"
        ) {
            return res
                .status(400)
                .json({ error: "month, year and inExType must be numbers." });
        }

        // Enum kontrolü
        if (!Object.values(EnumInExType).includes(inExType)) {
            return res.status(400).json({
                error: `Invalid type value: ${inExType}. Valid values are: ${Object.values(
                    EnumInExType
                ).join(", ")}`,
            });
        }

        const result = await updateMonthlyCategoryTotals(month, year, inExType);

        return res.status(200).json({ success: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

// Yeni endpoint: MonthlyTotals - Kullanıcıya ait aylık toplamları getirir
router.get("/MonthlyTotals/:userid", async (req, res) => {
    try {
        const { userid } = req.params;

        const incomeExpenses = await IncomeExpense.findAll({
            where: {
                UserId: userid,
            },
        });

        // Ay ve yıl bazında grupla ve toplam gelir/gider hesapla
        const monthlyTotals = incomeExpenses
            .reduce((acc, ie) => {
                const date = new Date(ie.Date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const key = `${year}-${month}`;

                if (!acc[key]) {
                    acc[key] = {
                        Year: year,
                        Month: month,
                        TotalIncome: 0,
                        TotalExpense: 0,
                    };
                }

                if (ie.InExType === EnumInExType.Income) {
                    acc[key].TotalIncome += ie.Amount;
                } else if (ie.InExType === EnumInExType.Expense) {
                    acc[key].TotalExpense += ie.Amount;
                }

                return acc;
            }, {});

        // Object to array ve sıralama
        const result = Object.values(monthlyTotals).sort((a, b) => {
            if (a.Year === b.Year) {
                return a.Month - b.Month;
            }
            return a.Year - b.Year;
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
});

router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await IncomeExpense.destroy({ where: { ID: id } });
        res.status(200).json({ message: "Silindi" });
    } catch (err) {
        res.status(500).json({ message: "Hata", error: err.message });
    }
});

// ✅ ID'ye göre getir
router.get("/id/:id", async (req, res) => {
    try {
        const result = await IncomeExpense.findByPk(req.params.id);
        if (!result) return res.status(404).json({ message: "Bulunamadı" });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Hata", error: err.message });
    }
});

// ✅ Tüm kayıtları getir
router.get("/", async (req, res) => {
    try {
        const result = await IncomeExpense.findAll();
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: "Hata", error: err.message });
    }
});

router.get("/type/:inExType/:userid", async (req, res) => {
    try {
        const { inExType, userid } = req.params;

        const type = parseInt(inExType);

        // Enum kontrolü
        if (type !== EnumInExType.Income && type !== EnumInExType.Expense) {
            return res.status(400).json({
                message: `Invalid type value: ${inExType}. Valid values are ${EnumInExType.Income} (Income) and ${EnumInExType.Expense} (Expense).`,
            });
        }

        const records = await IncomeExpense.findAll({
            where: {
                InExType: type,
                UserId: userid,
            },
            order: [["Date", "DESC"]],
        });

        return res.status(200).json(records);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Sunucu hatası", error: err.message });
    }
});

module.exports = router;
