const express = require("express");
const router = express.Router();
const {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} = require("../controllers/authController");
const { protectRoute } = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

module.exports = router;
