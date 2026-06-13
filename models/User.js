const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  guildId: String,
  discordId: String,
  timezone: { type: String, default: "America/Chicago" },
  acreditaciones: [
    {
      nombre: String,
      nota: String,
      fecha: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);