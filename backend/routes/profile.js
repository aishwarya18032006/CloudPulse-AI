import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const profile = await getProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json({ profile });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: "Could not load profile." });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const { display_name, organization, role } = req.body;

    if (!display_name?.trim()) {
      return res.status(400).json({ error: "Display name is required." });
    }

    const profile = await updateProfile(req.user.id, {
      display_name,
      organization,
      role,
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to save profile." });
  }
});

export default router;
