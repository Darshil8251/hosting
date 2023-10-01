const mongoose = require("mongoose");
const { Types } = mongoose;

const milkDetailSchema = mongoose.Schema(
  {
    providerId: {
      type: String,
      required: true,
    },
    cowPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    buffelowPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    otherPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    dateOfActivate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const milkPriceModel = mongoose.model("milkDetail", milkDetailSchema);
module.exports = milkPriceModel;
