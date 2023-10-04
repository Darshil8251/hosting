const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: true,
    },
    providerPhoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return v.length === 10;
        },
      },
    },
    providerPincode: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 6;
        },
      },
    },
    providerAddress: {
      type: String,
      required: true,
    },
    providerVacationMode: {
      type: Boolean,
      default: false,
    },
    providerIsActive: {
      type: Boolean,
      default: false,
    },
    cowPrice: {
      type: Number,
      default: 0,
      require: true,
    },
    buffelowPrice: {
      type: Number,
      default: 0,
      require: true,
    },
    otherPrice: {
      type: Number,
      default: 0,
      require: true,
    },
  },
  { timestamps: true }
);

const providerModel = mongoose.model("providerModel", providerSchema);
module.exports = providerModel;
