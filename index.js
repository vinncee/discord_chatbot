// Load environment variables
require("dotenv").config()

// Import required discord.js classes
const { Client, GatewayIntentBits, Events, Collection, REST, Routes } = require("discord.js")
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const fs = require("fs")
const path = require("path")
const { addMessage, getHistory } = require("./utils/conversation-memory")

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

// Collection for commands
client.commands = new Collection()

// Load command files
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)

  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command)
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
  }
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`)

  // Set bot status
  client.user.setPresence({
    activities: [{ name: "/help | Serving AI responses", type: 3 }],
    status: "online",
  })
})

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true })
    } else {
      await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true })
    }
  }
})

// Handle traditional message commands (with prefix)
const PREFIX = "!"

client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return

  // Check if message starts with the prefix
  if (!message.content.startsWith(PREFIX)) return

  // Parse command and arguments
  const args = message.content.slice(PREFIX.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  // Handle commands
  switch (commandName) {
    case "ping":
      message.reply("Pong! Bot is responsive.")
      break

    case "help":
      message.reply(`
Available commands:
!help - Display this help message
!ping - Check if the bot is responsive
!info - Get server information
!ask [question] - Ask the bot a question

Slash Commands:
/help - Display help information
/ping - Check if the bot is responsive
/info - Get server information
/ask - Ask the bot a question
/channel-setup - Set up channel-specific AI behaviors
      `)
      break

    case "info":
      if (message.guild) {
        message.reply(`
Server: ${message.guild.name}
Total members: ${message.guild.memberCount}
Created at: ${message.guild.createdAt.toDateString()}
        `)
      } else {
        message.reply("This command can only be used in a server.")
      }
      break

    case "ask":
      const question = args.join(" ")
      if (!question) {
        message.reply("Please provide a question after !ask")
        return
      }

      try {
        // Let the user know we're processing
        const thinkingMessage = await message.channel.send("Thinking...")

        // Add user's question to conversation history
        await addMessage(message.channelId, "user", question)

        // Get conversation history
        const history = getHistory(message.channelId)

        // Generate response using AI SDK with conversation history
        const { text } = await generateText({
          model: openai("gpt-4"),
          messages: [
            { role: "system", content: getSystemPromptForChannel(message.channelId) },
            ...history
          ],
          temperature: 0.7,
        })

        // Add AI's response to conversation history
        await addMessage(message.channelId, "assistant", text)

        // Send the response and delete the thinking message
        await message.reply(text)
        await thinkingMessage.delete().catch(console.error)
      } catch (error) {
        console.error("Error generating response:", error)
        message.reply("Sorry, I encountered an error processing your question.")
      }
      break

    default:
      message.reply(`Unknown command. Type ${PREFIX}help for a list of commands.`)
  }
})

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
    "You are a helpful assistant in a Discord server. Provide concise, accurate responses to user questions."
  )
}

// Register slash commands
const registerCommands = async () => {
  try {
    const commands = []

    for (const file of commandFiles) {
      const command = require(`./commands/${file}`)
      commands.push(command.data.toJSON())
    }

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN)

    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    // Check if we're in development or production
    if (process.env.NODE_ENV === "development" && process.env.GUILD_ID) {
      // In development, register commands to a specific guild for instant updates
      const data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: commands,
      })
      console.log(`Successfully reloaded ${data.length} guild (/) commands.`)
    } else {
      // In production, register global commands (takes up to an hour to propagate)
      const data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
      console.log(`Successfully reloaded ${data.length} global (/) commands.`)
    }
  } catch (error) {
    console.error("Error registering commands:", error)
  }
}

// Create a simple HTTP server to keep the bot alive on Render
// Render expects a web service that listens on a port
const http = require("http")
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Discord Bot is running!\n")
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

// Register commands and log in to Discord
;(async () => {
  try {
    // Register commands first
    await registerCommands()

    // Then log in to Discord
    await client.login(process.env.DISCORD_BOT_TOKEN)

    console.log("Bot startup complete!")
  } catch (error) {
    console.error("Error during startup:", error)
  }
})()

// Handle process termination gracefully
process.on("SIGINT", () => {
  console.log("Bot is shutting down...")
  client.destroy()
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("Bot is shutting down...")
  client.destroy()
  process.exit(0)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error)
})
