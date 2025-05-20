const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("info").setDescription("Get information about the server"),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply("This command can only be used in a server.")
    }

    const guild = interaction.guild

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "Created At", value: guild.createdAt.toDateString(), inline: true },
        { name: "Server ID", value: guild.id, inline: true },
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        { name: "Members", value: guild.memberCount.toString(), inline: true },
        { name: "Channels", value: guild.channels.cache.size.toString(), inline: true },
        { name: "Roles", value: guild.roles.cache.size.toString(), inline: true },
      )
      .setFooter({ text: "Server Information" })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
