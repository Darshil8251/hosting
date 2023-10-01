const mongoose = require("mongoose");

const milkInfoSchema = mongoose.Schema(
  {
    providerId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    cowMorning: {
      type: Number,
      required: true,
    },
    cowEvening: {
      type: Number,
      required: true,
    },
    buffelowMorning: {
      type: Number,
      required: true,
    },
    buffelowEvening: {
      type: Number,
      required: true,
    },
    otherMorning: {
      type: Number,
      required: true,
    },
    otherEvening: {
      type: Number,
      required: true,
    },
    isApprove: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MilkInfoModel = mongoose.model("milkInfoModel", milkInfoSchema);
module.exports = MilkInfoModel;
