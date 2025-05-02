const router = require("express").Router();
const { db } = require("../firebase");
const { v4: uuidv4 } = require("uuid");

// Создание релиза
router.post("/", async (req, res) => {
  try {
    const { projectId, name, activitiesSnapshot } = req.body;

    if (!projectId || !name || !activitiesSnapshot) {
      return res.status(400).json({ error: "Недостаточно данных для релиза" });
    }

    const releaseId = uuidv4();
    const release = {
      id: releaseId,
      projectId,
      name,
      activitiesSnapshot,
      createdAt: new Date().toISOString()
    };

    await db.collection("releases").doc(releaseId).set(release);

    res.status(201).json({ message: "Релиз создан", id: releaseId });
  } catch (err) {
    console.error("Ошибка создания релиза:", err);
    res.status(500).json({ error: "Ошибка при создании релиза" });
  }
});

// Получение релизов по projectId
router.get("/", async (req, res) => {
  const { projectId } = req.query;

  if (!projectId) {
    return res.status(400).json({ error: "projectId обязателен" });
  }

  try {
    const snapshot = await db.collection("releases")
      .where("projectId", "==", projectId)
      .get();

    const releases = [];
    snapshot.forEach(doc => releases.push(doc.data()));
    res.status(200).json(releases);
  } catch (err) {
    console.error("Ошибка получения релизов:", err);
    res.status(500).json({ error: "Ошибка при получении релизов" });
  }
});

// Обновление релиза
router.put("/:id", async (req, res) => {
  const releaseId = req.params.id;
  const updated = req.body;

  try {
    await db.collection("releases").doc(releaseId).update(updated);
    res.status(200).json({ message: "Релиз обновлён" });
  } catch (err) {
    console.error("Ошибка при обновлении релиза:", err);
    res.status(500).json({ error: "Ошибка при обновлении релиза" });
  }
});
router.delete("/by-project/:projectId", async (req, res) => {
  const { projectId } = req.params;

  try {
    const snapshot = await db
      .collection("releases")
      .where("projectId", "==", projectId)
      .get();

    const batch = db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    res.status(200).json({ message: "Все релизы удалены" });
  } catch (err) {
    console.error("Ошибка при удалении релизов:", err);
    res.status(500).json({ error: "Ошибка удаления" });
  }
});
// Удаление релиза
router.delete("/:id", async (req, res) => {
  const releaseId = req.params.id;

  try {
    await db.collection("releases").doc(releaseId).delete();
    res.status(200).json({ message: "Релиз удалён" });
  } catch (err) {
    console.error("Ошибка при удалении релиза:", err);
    res.status(500).json({ error: "Ошибка при удалении релиза" });
  }
});

module.exports = router;