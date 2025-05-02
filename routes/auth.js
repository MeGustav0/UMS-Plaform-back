const express = require("express");
const router = express.Router();
const { auth, db } = require("../firebase");
const { v4: uuidv4 } = require("uuid");

router.post("/register", async (req, res) => {
  try {
    const { idToken, name } = req.body;

    const decoded = await auth.verifyIdToken(idToken);
    const userId = decoded.uid;
    const email = decoded.email;

    const orgId = uuidv4();
    const organization = {
      id: orgId,
      name: `${name}'s Organization`,
      creatorId: userId,
      members: [{ userId, role: "admin" }],
    };

    await db.collection("organizations").doc(orgId).set(organization);

    await db.collection("users").doc(userId).set({
      id: userId,
      email,
      name,
      orgId,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Пользователь зарегистрирован", userId });
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: "Такой email уже зарегистрирован" });
    }
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { idToken } = req.body;

    const decoded = await auth.verifyIdToken(idToken);
    const userId = decoded.uid;

    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.data();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Пользователь не найден в базе данных" });
    }

    res.status(200).json({
      uid: userData.id,
      email: userData.email,
      name: userData.name,
    });
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(401).json({ error: "Невалидный токен" });
  }
});

module.exports = router;