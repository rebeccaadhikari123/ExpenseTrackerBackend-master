const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: [true, "Bank name is required"],
    trim: true,
    maxlength: [80, "Bank name must be less than 80 characters"],
    minlength: [3, "Bank name must be more than 3 characters"],
  },
  bankAddress: {
    type: String,
    required: [true, "Bank address is required"],
  },
  addedOn: {
    type: Date,
    default: Date.now(),
  },
  addedBy:{
      type:mongoose.Schema.Types.ObjectId,
      required:[true,'Bank must belong to some admin.']
  }
});

const Bank = mongoose.model("Bank", bankSchema);

module.exports = Bank;
