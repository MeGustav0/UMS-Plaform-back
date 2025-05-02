const router = require("express").Router();
const { db } = require("../firebase");

// Получить массив пользователей по массиву ID
router.post("/by-ids", async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids должен быть непустым массивом" });
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("id", "in", ids).get();

    const users = [];
    snapshot.forEach(doc => users.push(doc.data()));

    res.status(200).json(users);
  } catch (error) {
    console.error("Ошибка при получении пользователей по ID:", error);
    res.status(500).json({ error: "Ошибка при получении пользователей" });
  }
});

module.exports = router;