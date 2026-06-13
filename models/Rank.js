const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema({
  guildId: String,
  nombre: String,
  imagen: String
});

module.exports = mongoose.model("Rank", rankSchema);