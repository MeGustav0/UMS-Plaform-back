const express = require("express");
const router = express.Router();
const { db } = require("../firebase");
const { v4: uuidv4 } = require("uuid");

router.get("/", async (req, res) => {
  const { orgId } = req.query;

  if (!orgId) {
    return res.status(400).json({ error: "orgId не передан" });
  }

  try {
    const snapshot = await db
      .collection("projects")
      .where("orgId", "==", orgId)
      .get();

    const projects = [];
    snapshot.forEach((doc) => projects.push(doc.data()));

    res.status(200).json(projects);
  } catch (error) {
    console.error("Ошибка при получении проектов:", error);
    res.status(500).json({ error: "Ошибка при получении проектов" });
  }
});

// Создать проект
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description = "",
      deadline = "",
      orgId,
      creatorId,
      memberInfo,
      members = [],
    } = req.body;

    if (!name || !orgId || !creatorId) {
      return res
        .status(400)
        .json({ error: "Недостаточно данных для создания проекта" });
    }

    const projectId = uuidv4();

    // Если передали пусто — добавляем только создателя
    const safeMembers = members.length
      ? members
      : [
          {
            userId: creatorId,
            name: memberInfo?.name || "",
            email: memberInfo?.email || "",
            role: "admin",
          },
        ];

    const project = {
      id: projectId,
      name,
      description,
      deadline,
      orgId,
      creatorId,
      members: safeMembers,
      activities: [],
      createdAt: new Date().toISOString(),
    };

    await db.collection("projects").doc(projectId).set(project);

    res.status(201).json({ message: "Проект создан", projectId });
  } catch (error) {
    console.error("Ошибка при создании проекта:", error);
    res.status(500).json({ error: "Ошибка при создании проекта" });
  }
});
router.put("/:id", async (req, res) => {
  const projectId = req.params.id;
  const updatedProject = req.body;

  try {
    await db.collection("projects").doc(projectId).update(updatedProject);
    res.status(200).json({ message: "Проект обновлён" });
  } catch (error) {
    console.error("Ошибка при обновлении проекта:", error);
    res.status(500).json({ error: "Ошибка при обновлении проекта" });
  }
});
router.delete("/:id", async (req, res) => {
  const projectId = req.params.id;

  try {
    await db.collection("projects").doc(projectId).delete();
    res.status(200).json({ message: "Проект удалён" });
  } catch (error) {
    console.error("Ошибка при удалении проекта:", error);
    res.status(500).json({ error: "Ошибка при удалении проекта" });
  }
});

module.exports = router;
