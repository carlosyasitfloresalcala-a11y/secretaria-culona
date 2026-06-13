require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} = require("discord.js");

const mongoose = require("mongoose");
const User = require("./models/User");
const Rank = require("./models/Rank");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(console.error);

client.once("ready", () => {
  console.log(`Bot activo como ${client.user.tag}`);
});

function crearMenu(id, placeholder, opciones) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(id)
      .setPlaceholder(placeholder)
      .addOptions(opciones)
  );
}

client.on("interactionCreate", async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "horarios") {
        return interaction.reply({
          content: "📅 Menú de horarios",
          ephemeral: true,
          components: [
            crearMenu("menu_horarios", "Elige una opción", [
              { label: "Ver hora actual de todos", value: "ver_horas" },
              { label: "Convertir hora para todos", value: "convertir_hora" },
              { label: "Configurar mi zona horaria", value: "config_zona" }
            ])
          ]
        });
      }

      if (interaction.commandName === "acreditaciones") {
        return interaction.reply({
          content: "🎖️ Menú de acreditaciones",
          ephemeral: true,
          components: [
            crearMenu("menu_acreditaciones", "Elige una opción", [
              { label: "Dar acreditación", value: "dar_acreditacion" },
              { label: "Quitar acreditación", value: "quitar_acreditacion" },
              { label: "Ver acreditaciones", value: "ver_acreditaciones" }
            ])
          ]
        });
      }

      if (interaction.commandName === "almanaque") {
        return interaction.reply({
          content: "👔 Menú de almanaque",
          ephemeral: true,
          components: [
            crearMenu("menu_almanaque", "Elige una opción", [
              { label: "Ver uniformes", value: "ver_uniformes" },
              { label: "Agregar rango con foto", value: "agregar_rango" },
              { label: "Cambiar foto", value: "cambiar_foto" },
              { label: "Eliminar foto", value: "eliminar_foto" },
              { label: "Eliminar rango", value: "eliminar_rango" }
            ])
          ]
        });
      }
    }

    if (interaction.isStringSelectMenu()) {
      const value = interaction.values[0];

      if (value === "config_zona") {
        const modal = new ModalBuilder()
          .setCustomId("modal_config_zona")
          .setTitle("Configurar zona horaria");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("zona")
              .setLabel("Ejemplo: America/Chicago")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "ver_horas") {
        const users = await User.find({ guildId: interaction.guildId });

        if (!users.length) {
          return interaction.reply({
            content: "Nadie ha configurado su zona horaria todavía.",
            ephemeral: true
          });
        }

        let texto = "📅 **Hora actual de los participantes:**\n\n";

        for (const user of users) {
          const member = await interaction.guild.members.fetch(user.discordId).catch(() => null);
          const nombre = member ? member.user.username : user.discordId;

          const hora = new Date().toLocaleString("es-MX", {
            timeZone: user.timezone,
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });

          texto += `**${nombre}** — ${hora} — \`${user.timezone}\`\n`;
        }

        return interaction.reply({ content: texto, ephemeral: true });
      }

      if (value === "convertir_hora") {
        const modal = new ModalBuilder()
          .setCustomId("modal_convertir_hora")
          .setTitle("Convertir hora");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("fecha")
              .setLabel("Fecha: YYYY-MM-DD")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("hora")
              .setLabel("Hora: HH:mm ejemplo 20:00")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("zona")
              .setLabel("Zona origen: America/Chicago")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "dar_acreditacion") {
        const modal = new ModalBuilder()
          .setCustomId("modal_dar_acreditacion")
          .setTitle("Dar acreditación");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("usuario").setLabel("ID o mención del usuario").setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("nombre").setLabel("Nombre de la prueba").setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("nota").setLabel("Nota o descripción").setStyle(TextInputStyle.Paragraph).setRequired(false)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "quitar_acreditacion") {
        const modal = new ModalBuilder()
          .setCustomId("modal_quitar_acreditacion")
          .setTitle("Quitar acreditación");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("usuario").setLabel("ID o mención del usuario").setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("nombre").setLabel("Nombre exacto de la acreditación").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "ver_acreditaciones") {
        const modal = new ModalBuilder()
          .setCustomId("modal_ver_acreditaciones")
          .setTitle("Ver acreditaciones");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("usuario").setLabel("ID o mención del usuario").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "agregar_rango" || value === "cambiar_foto") {
        const modal = new ModalBuilder()
          .setCustomId(value === "agregar_rango" ? "modal_agregar_rango" : "modal_cambiar_foto")
          .setTitle(value === "agregar_rango" ? "Agregar rango" : "Cambiar foto");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("rango").setLabel("Nombre del rango").setStyle(TextInputStyle.Short).setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("imagen").setLabel("URL de la imagen").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "eliminar_foto" || value === "eliminar_rango") {
        const modal = new ModalBuilder()
          .setCustomId(value === "eliminar_foto" ? "modal_eliminar_foto" : "modal_eliminar_rango")
          .setTitle(value === "eliminar_foto" ? "Eliminar foto" : "Eliminar rango");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("rango").setLabel("Nombre exacto del rango").setStyle(TextInputStyle.Short).setRequired(true)
          )
        );

        return interaction.showModal(modal);
      }

      if (value === "ver_uniformes") {
        const ranks = await Rank.find({ guildId: interaction.guildId });

        if (!ranks.length) {
          return interaction.reply({
            content: "No hay rangos guardados todavía.",
            ephemeral: true
          });
        }

        const embeds = ranks.map(rank => {
          const embed = new EmbedBuilder()
            .setTitle(`Uniforme: ${rank.nombre}`)
            .setColor(0x2b2d31);

          if (rank.imagen) embed.setImage(rank.imagen);
          else embed.setDescription("Este rango no tiene foto.");

          return embed;
        });

        return interaction.reply({ embeds, ephemeral: true });
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "modal_config_zona") {
        const zona = interaction.fields.getTextInputValue("zona");

        await User.findOneAndUpdate(
          { guildId: interaction.guildId, discordId: interaction.user.id },
          { timezone: zona },
          { upsert: true, new: true }
        );

        return interaction.reply({
          content: `Zona horaria guardada: \`${zona}\``,
          ephemeral: true
        });
      }

      if (interaction.customId === "modal_convertir_hora") {
        const fecha = interaction.fields.getTextInputValue("fecha");
        const hora = interaction.fields.getTextInputValue("hora");

        const users = await User.find({ guildId: interaction.guildId });
        const baseDate = new Date(`${fecha}T${hora}:00`);

        let texto = `🕒 **Hora convertida para todos:**\nBase: ${fecha} ${hora}\n\n`;

        for (const user of users) {
          const member = await interaction.guild.members.fetch(user.discordId).catch(() => null);
          const nombre = member ? member.user.username : user.discordId;

          const convertido = baseDate.toLocaleString("es-MX", {
            timeZone: user.timezone,
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });

          texto += `**${nombre}** — ${convertido} — \`${user.timezone}\`\n`;
        }

        return interaction.reply({ content: texto, ephemeral: true });
      }

      if (interaction.customId === "modal_dar_acreditacion") {
        const usuario = interaction.fields.getTextInputValue("usuario").replace(/[<@!>]/g, "");
        const nombre = interaction.fields.getTextInputValue("nombre");
        const nota = interaction.fields.getTextInputValue("nota") || "Sin nota";

        await User.findOneAndUpdate(
          { guildId: interaction.guildId, discordId: usuario },
          { $push: { acreditaciones: { nombre, nota, fecha: new Date() } } },
          { upsert: true, new: true }
        );

        return interaction.reply({
          content: `Acreditación asignada a <@${usuario}>: **${nombre}**`,
          ephemeral: true
        });
      }

      if (interaction.customId === "modal_quitar_acreditacion") {
        const usuario = interaction.fields.getTextInputValue("usuario").replace(/[<@!>]/g, "");
        const nombre = interaction.fields.getTextInputValue("nombre");

        await User.findOneAndUpdate(
          { guildId: interaction.guildId, discordId: usuario },
          { $pull: { acreditaciones: { nombre } } }
        );

        return interaction.reply({
          content: `Acreditación eliminada de <@${usuario}>: **${nombre}**`,
          ephemeral: true
        });
      }

      if (interaction.customId === "modal_ver_acreditaciones") {
        const usuario = interaction.fields.getTextInputValue("usuario").replace(/[<@!>]/g, "");
        const user = await User.findOne({ guildId: interaction.guildId, discordId: usuario });

        if (!user || !user.acreditaciones.length) {
          return interaction.reply({
            content: `<@${usuario}> no tiene acreditaciones.`,
            ephemeral: true
          });
        }

        let texto = `🎖️ **Acreditaciones de <@${usuario}>:**\n\n`;
        user.acreditaciones.forEach((a, i) => {
          texto += `${i + 1}. **${a.nombre}** — ${a.nota}\n`;
        });

        return interaction.reply({ content: texto, ephemeral: true });
      }

      if (interaction.customId === "modal_agregar_rango" || interaction.customId === "modal_cambiar_foto") {
        const rango = interaction.fields.getTextInputValue("rango");
        const imagen = interaction.fields.getTextInputValue("imagen");

        await Rank.findOneAndUpdate(
          { guildId: interaction.guildId, nombre: rango },
          { imagen },
          { upsert: true, new: true }
        );

        return interaction.reply({
          content: `Rango guardado/cambiado: **${rango}**`,
          ephemeral: true
        });
      }

      if (interaction.customId === "modal_eliminar_foto") {
        const rango = interaction.fields.getTextInputValue("rango");

        await Rank.findOneAndUpdate(
          { guildId: interaction.guildId, nombre: rango },
          { imagen: "" }
        );

        return interaction.reply({
          content: `Foto eliminada del rango: **${rango}**`,
          ephemeral: true
        });
      }

      if (interaction.customId === "modal_eliminar_rango") {
        const rango = interaction.fields.getTextInputValue("rango");

        await Rank.findOneAndDelete({
          guildId: interaction.guildId,
          nombre: rango
        });

        return interaction.reply({
          content: `Rango eliminado: **${rango}**`,
          ephemeral: true
        });
      }
    }
  } catch (error) {
    console.error(error);

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({
        content: "Ocurrió un error. Revisa la consola.",
        ephemeral: true
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);