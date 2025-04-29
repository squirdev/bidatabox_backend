const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChargeLogSchema = new mongoose.Schema(
  {
    userid: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: { type: String, required: true },
    amount: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChargeLog", ChargeLogSchema);
