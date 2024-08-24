const express = require('express');
const router = express.Router();
const userRouter = require('./userRoutes');
const friendsRouter = require('./friendRoutes');
const messageRouter = require('./messageRoutes');

router.use('/users', userRouter);
router.use('/friends', friendsRouter);
router.use('/messages', messageRouter);

module.exports = router;
