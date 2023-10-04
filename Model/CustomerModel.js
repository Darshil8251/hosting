const mongoose = require("mongoose");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

const CustomerMasterSchema = mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    customerPhoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return v.length === 10;
        },
      },
    },
    customerAddress: {
      type: String,
      required: true,
    },
    customerPincode: {
      type: String,
      required: true,
    },
    customerVacationMode: {
      type: Boolean,
      default: false,
    },
    customerIsActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const CustomerMaster = mongoose.model("CustomerModel", CustomerMasterSchema);
module.exports = CustomerMaster;
