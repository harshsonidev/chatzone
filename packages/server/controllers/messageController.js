const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");

const ObjectId = (str = "") => new mongoose.Types.ObjectId(str);

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  const currentUserId = ObjectId(req.user._id);
  const receiverId = ObjectId(req.params.recieverId);

  const data = {
    sender: currentUserId,
    reciever: receiverId,
    message: { content: message },
  };

  await Message.create(data);

  res.status(200).json({
    status: "success",
    message: "Messsage saved",
  });
});

exports.getAllMessage = catchAsync(async (req, res, next) => {
  const receiverId = ObjectId(req.params.recieverId);
  const currentUserId = ObjectId(req.user._id);

  const messages = await Message.find({
    $or: [
      { sender: currentUserId, reciever: receiverId },
      { sender: receiverId, reciever: currentUserId },
    ],
  }).sort({
    createdAt: 1,
  });

  res.status(200).json({
    status: "success",
    data: messages,
  });
});
