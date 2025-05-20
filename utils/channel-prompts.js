// Helper module to get channel-specific system prompts
module.exports = {
  getSystemPromptForChannel: (channelId) => {
    // Define channel-specific system prompts
    const channelPrompts = {
      // Replace these IDs with your actual channel IDs
      "marketing-channel-id":
        "You are a marketing assistant. Help with campaign ideas, content strategies, and marketing analytics.",
      "sales-channel-id":
        "You are a sales assistant. Help with sales strategies, customer objections, and sales forecasting.",
      "engineering-channel-id":
        "You are an engineering assistant. Help with code reviews, architecture decisions, and technical documentation.",
      "hr-channel-id":
        "You are an HR assistant. Help with policy questions, onboarding processes, and employee engagement ideas.",
    }

    return (
      channelPrompts[channelId] ||
      "You are a helpful assistant in a Discord server. Provide concise, accurate responses to user questions."
    )
  },
}
