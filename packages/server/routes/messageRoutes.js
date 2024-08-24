const express = require("express");
const router = express.Router();
const { getAllMessage, sendMessage } = require("../controllers/messageController");

const { protect } = require("../controllers/authController");

router.use(protect);
router.get("/:recieverId", getAllMessage);
router.post("/sendMessage/:recieverId", sendMessage);

module.exports = router;
