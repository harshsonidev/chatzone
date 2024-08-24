const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reciever: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: { type: String, default: "text" }, content: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

messageSchema.index({ sender: 1, receiver: 1 });

const Message = mongoose.model("messages", messageSchema);

module.exports = Message;
