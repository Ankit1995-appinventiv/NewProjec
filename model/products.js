const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  productname: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,

    size: {
      type: String
    }
  },
  image: {
    type: String
  },
  seller: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller"
    }
  ]
});

let productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
