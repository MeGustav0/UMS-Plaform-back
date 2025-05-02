const router = require("express").Router();
const { db } = require("../firebase");
const { v4: uuidv4 } = require("uuid");

// Получить все организации, где пользователь участвует
router.get("/", async (req, res) => {
  const { memberId } = req.query;

  if (!memberId) {
    return res.status(400).json({ error: "memberId не передан" });
  }

  try {
    const snapshot = await db.collection("organizations").get();
    const result = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMember = data.members?.some((m) => m.userId === memberId);
      if (isMember) {
        result.push(data);
      }
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Ошибка при получении организаций:", error);
    res.status(500).json({ error: "Ошибка при получении организаций" });
  }
});

// Создать организацию вручную
router.post("/", async (req, res) => {
  try {
    const { name, ownerId } = req.body;
    const orgId = uuidv4();

    const organization = {
      id: orgId,
      name,
      creatorId: ownerId,
      members: [{ userId: ownerId, role: "admin" }],
    };

    await db.collection("organizations").doc(orgId).set(organization);
    res.status(201).json({ id: orgId });
  } catch (error) {
    console.error("Ошибка при создании организации:", error);
    res.status(500).json({ error: "Ошибка при создании организации" });
  }
});

// Удалить организацию
router.delete("/:id", async (req, res) => {
  try {
    const orgId = req.params.id;
    await db.collection("organizations").doc(orgId).delete();
    res.status(200).json({ message: "Организация удалена" });
  } catch (error) {
    console.error("Ошибка при удалении организации:", error);
    res.status(500).json({ error: "Ошибка при удалении организации" });
  }
});

// Добавить участника по email
router.patch("/:orgId/add-member", async (req, res) => {
  const { email, role = "member" } = req.body;
  const orgId = req.params.orgId;

  try {
    const userSnap = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userSnap.empty) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const user = userSnap.docs[0].data();
    const userId = user.id;

    const orgRef = db.collection("organizations").doc(orgId);
    const orgDoc = await orgRef.get();
    const org = orgDoc.data();

    if (!org.members.some((m) => m.userId === userId)) {
      org.members.push({ userId, role });
      await orgRef.update({ members: org.members });
    }

    res
      .status(200)
      .json({ message: "Участник добавлен", members: org.members });
  } catch (error) {
    console.error("Ошибка при добавлении участника:", error);
    res.status(500).json({ error: "Ошибка при добавлении участника" });
  }
});

// Обновить роль участника
router.patch("/:orgId/update-role", async (req, res) => {
  const { userId, role } = req.body;
  const orgId = req.params.orgId;

  try {
    const orgRef = db.collection("organizations").doc(orgId);
    const orgDoc = await orgRef.get();
    const org = orgDoc.data();

    const member = org.members.find((m) => m.userId === userId);
    if (member) {
      member.role = role;
      await orgRef.update({ members: org.members });
      return res
        .status(200)
        .json({ message: "Роль обновлена", members: org.members });
    }

    res.status(404).json({ error: "Пользователь не найден в организации" });
  } catch (error) {
    console.error("Ошибка при обновлении роли:", error);
    res.status(500).json({ error: "Ошибка при обновлении роли" });
  }
});

// Удалить участника
router.patch("/:orgId/remove-member", async (req, res) => {
  const { userId } = req.body;
  const orgId = req.params.orgId;

  try {
    const orgRef = db.collection("organizations").doc(orgId);
    const orgDoc = await orgRef.get();
    const org = orgDoc.data();

    org.members = org.members.filter((m) => m.userId !== userId);
    await orgRef.update({ members: org.members });

    res.status(200).json({ message: "Участник удалён", members: org.members });
  } catch (error) {
    console.error("Ошибка при удалении участника:", error);
    res.status(500).json({ error: "Ошибка при удалении участника" });
  }
});

module.exports = router;
