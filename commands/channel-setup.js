const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channel-setup")
    .setDescription("Configure AI behavior for this channel")
    .addStringOption((option) =>
      option
        .setName("role")
        .setDescription("The role of the AI in this channel")
        .setRequired(true)
        .addChoices(
          { name: "General Assistant", value: "general" },
          { name: "Marketing Assistant", value: "marketing" },
          { name: "Sales Assistant", value: "sales" },
          { name: "Engineering Assistant", value: "engineering" },
          { name: "HR Assistant", value: "hr" },
          { name: "Custom", value: "custom" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("custom_prompt")
        .setDescription("Custom system prompt (only used if role is set to 'Custom')")
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    // This would normally save to a database
    // For this example, we'll just acknowledge the command

    const role = interaction.options.getString("role")
    const customPrompt = interaction.options.getString("custom_prompt")

    let systemPrompt = ""

    switch (role) {
      case "general":
        systemPrompt =
          "You are a helpful assistant in a Discord server. Provide concise, accurate responses to user questions."
        break
      case "marketing":
        systemPrompt =
          "You are a marketing assistant. Help with campaign ideas, content strategies, and marketing analytics."
        break
      case "sales":
        systemPrompt =
          "You are a sales assistant. Help with sales strategies, customer objections, and sales forecasting."
        break
      case "engineering":
        systemPrompt =
          "You are an engineering assistant. Help with code reviews, architecture decisions, and technical documentation."
        break
      case "hr":
        systemPrompt =
          "You are an HR assistant. Help with policy questions, onboarding processes, and employee engagement ideas."
        break
      case "custom":
        if (!customPrompt) {
          return interaction.reply({
            content: "You must provide a custom prompt when selecting the 'Custom' role.",
            ephemeral: true,
          })
        }
        systemPrompt = customPrompt
        break
    }

    // Here you would save the channel configuration to a database
    // For now, we'll just acknowledge it

    await interaction.reply({
      content: `Channel AI behavior configured as: ${role === "custom" ? "Custom" : `${role.charAt(0).toUpperCase() + role.slice(1)} Assistant`}`,
      ephemeral: true,
    })
  },
}
