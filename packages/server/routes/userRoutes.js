const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require("../controllers/userController");

const {
  protect,
  signup,
  login,
  logout,
  updatePassword,
  forgotPassword,
  resetPassword,
  restrictTo,
} = require("../controllers/authController");

// Public
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forget-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

// Authenticated
router.use(protect); // This middleware will protect all the router after this middleware.
router.post("/update-password", updatePassword);
router.get("/me", getMe, getUser);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);
router.route("/user/:id").get(getUser);

router.use(restrictTo("admin")); // This middleware will only allow admins to perform action after this middleware.
router.route("/users").get(getAllUsers);
router.route("/user/:id").patch(updateUser).delete(deleteUser);

module.exports = router;
