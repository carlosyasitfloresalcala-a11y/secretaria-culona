require("dotenv").config();

const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder().setName("horarios").setDescription("Menú de horarios"),
  new SlashCommandBuilder().setName("acreditaciones").setDescription("Menú de acreditaciones"),
  new SlashCommandBuilder().setName("almanaque").setDescription("Menú de uniformes por rango")
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registrando comandos...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Comandos registrados.");
  } catch (error) {
    console.error(error);
  }
})();