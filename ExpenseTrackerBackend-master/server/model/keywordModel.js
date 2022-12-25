const mongoose = require("mongoose");

const keywordSchema = new mongoose.Schema({
  keywordName: {
    type: String,
    required: [true, "Keyword is required"],
    trim: true,
    maxlength: [20, "Keyword must be less than 20 characters"],
    minlength: [1, "Keyword must be more than 1 characters"],
  },
  addedBy:{
      type:mongoose.Schema.Types.ObjectId,
      required:[true,'Keyword must belong to some admin.']
  }
});

const Keyword= mongoose.model("Keyword", keywordSchema);

module.exports = Keyword;
