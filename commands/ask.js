const { SlashCommandBuilder } = require("discord.js")
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const { addMessage, getHistory, clearHistory } = require("../utils/conversation-memory")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask the AI a question")
    .addStringOption((option) => option.setName("question").setDescription("The question to ask").setRequired(true))
    .addBooleanOption((option) => 
      option.setName("clear_context")
        .setDescription("Clear the conversation history for this channel")
        .setRequired(false)
    ),
  async execute(interaction) {
    const question = interaction.options.getString("question")
    const clearContext = interaction.options.getBoolean("clear_context") || false

    await interaction.deferReply()

    try {
      // Clear context if requested
      if (clearContext) {
        await clearHistory(interaction.channelId)
        await interaction.editReply("Conversation history cleared!")
        return
      }

      // Get channel-specific system prompt
      const systemPrompt = getSystemPromptForChannel(interaction.channelId)

      // Add user's question to conversation history
      await addMessage(interaction.channelId, "user", question)

      // Get conversation history
      const history = getHistory(interaction.channelId)

      // Generate response using AI SDK with conversation history
      const { text } = await generateText({
        model: openai("gpt-4"),
        messages: [
          { role: "system", content: systemPrompt },
          ...history
        ],
        temperature: 0.7,
      })

      // Add AI's response to conversation history
      await addMessage(interaction.channelId, "assistant", text)

      // If response is too long for Discord (max 2000 chars)
      if (text.length > 2000) {
        const chunks = splitMessage(text)
        await interaction.editReply(chunks[0])

        // Send additional chunks as follow-up messages
        for (let i = 1; i < chunks.length; i++) {
          await interaction.followUp(chunks[i])
        }
      } else {
        await interaction.editReply(text)
      }
    } catch (error) {
      console.error("Error generating response:", error)
      await interaction.editReply("Sorry, I encountered an error processing your question.")
    }
  },
}

// Helper function to get channel-specific system prompts
function getSystemPromptForChannel(channelId) {
  // Load channel configurations from database or file
  // For now, we'll use a simple object
  const channelPrompts = {
    // Replace these with your actual channel IDs
    // "1234567890123456789": "You are a marketing assistant...",
  }

  return (
    channelPrompts[channelId] ||
    "You are a helpful assistant in a Discord server. Provide concise, accurate responses to user questions. Remember the context of the conversation and maintain continuity in your responses."
  )
}

// Helper function to split long messages
function splitMessage(text, maxLength = 2000) {
  const chunks = []
  let currentChunk = ""

  // Split by paragraphs first
  const paragraphs = text.split("\n")

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit
    if (currentChunk.length + paragraph.length + 1 > maxLength) {
      // If the current chunk is not empty, push it
      if (currentChunk.length > 0) {
        chunks.push(currentChunk)
        currentChunk = ""
      }

      // If the paragraph itself is too long, split it
      if (paragraph.length > maxLength) {
        let remainingParagraph = paragraph
        while (remainingParagraph.length > 0) {
          const chunk = remainingParagraph.substring(0, maxLength)
          chunks.push(chunk)
          remainingParagraph = remainingParagraph.substring(maxLength)
        }
      } else {
        currentChunk = paragraph
      }
    } else {
      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += "\n" + paragraph
      } else {
        currentChunk = paragraph
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}
