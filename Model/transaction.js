const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
    },
    providerId: {
      type: String,
      required: true,
      default: 0,
    },
    morningTransaction: {
      type: Boolean,
      required: true,
      default: false,
    },
    eveningTransaction: {
      type: Boolean,
      required: true,
      default: false,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    cowMorning: {
      type: Number,
      required: true,
      default: 0,
    },
    buffelowMorning: {
      type: Number,
      required: true,
      default: 0,
    },
    otherMorning: {
      type: Number,
      required: true,
      default: 0,
    },
    cowEvening: {
      type: Number,
      required: true,
      default: 0,
    },
    buffelowEvening: {
      type: Number,
      required: true,
      default: 0,
    },
    otherEvening: {
      type: Number,
      required: true,
      default: 0,
    },
    completeTransaction: {
      type: Boolean,
      required: true,
      default: false,
    },
    previousAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    theseMonthAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("transactionModel", transactionSchema);

module.exports = transactionModel;
