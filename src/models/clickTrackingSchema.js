
const mongoose = require("mongoose");

const clickTrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserDetails" },
  clicks: [{
    url: String,
    count: { type: Number, default: 1 }
  }],
  traversal: [{
    url: String,
    timestamp: { type: Date, default: Date.now }
  }]
},
{ timestamps: true }
)


const clickTrackingModel = new mongoose.model("ticker", clickTrackingSchema);

module.exports = { clickTrackingModel };
