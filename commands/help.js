const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Shows a list of available commands"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Bot Commands")
      .setDescription("Here are all the available commands:")
      .addFields(
        {
          name: "Slash Commands",
          value:
            "`/help` - Display this help message\n" +
            "`/ping` - Check bot responsiveness and latency\n" +
            "`/info` - Get information about the server\n" +
            "`/ask` - Ask the AI a question\n" +
            "`/channel-setup` - Configure AI behavior for specific channels",
        },
        {
          name: "Text Commands",
          value:
            "`!help` - Display help information\n" +
            "`!ping` - Check if the bot is responsive\n" +
            "`!info` - Get server information\n" +
            "`!ask [question]` - Ask the AI a question",
        },
      )
      .setFooter({ text: "AI-Powered Discord Bot" })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
