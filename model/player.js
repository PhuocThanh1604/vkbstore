const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const Schema = mongoose.Schema;

const playerSchema = new Schema(
  {
    name: { type: String, required: true },
    images: [{ type: String, required: true }],
    desc: { type: String },
    position: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "nations",
      required: true,
    },
    isCaptain: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Player = mongoose.model("Player", playerSchema);

module.exports = Player;
const player = new Player(data);
player.images = req.body.images; // Gán mảng ảnh từ req.body.images
await player.save();