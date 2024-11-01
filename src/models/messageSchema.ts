import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    attachment: {
      type: [String],
    },
    message: {
      type: String,
    },
    senderId: {
      type: String,
    },
    chatId: Number,
    seen_at: { type: Date, default: null },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

export default Message;
