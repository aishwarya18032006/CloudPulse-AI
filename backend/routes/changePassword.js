import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { changePassword } from "../controllers/profileController.js";

const router = Router();

router.put("/", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: "Current password is required." });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Confirm password must match new password." });
    }

    const result = await changePassword(req.user.id, { currentPassword, newPassword });

    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Failed to update password." });
  }
});

export default router;
