const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActivityLogSchema = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    entirenumber: { type: Number },
    type: { type: String },
    perprice: { type: Number },
    consume: { type: Number },
    benefit: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
