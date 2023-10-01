const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    providerId: {
      type: String,
      required: true,
    },
    customerId: {
      type: String,
      required: true,
    },
    modeOfPayment: {
      type: String,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const paymentModel = mongoose.model("Payment", paymentSchema);
module.exports = paymentModel;
