const mongoose = require("mongoose");

const sellerSchema = mongoose.Schema({
  sellername: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  tokens: [
    {
      token: {
        type: String
      }
    }
  ],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products"
    }
  ]
});

let sellerModel = mongoose.model("Seller", sellerSchema);

module.exports = sellerModel;
