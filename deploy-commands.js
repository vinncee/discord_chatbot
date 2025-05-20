// This script can be run separately to register slash commands
require("dotenv").config()
const { REST, Routes } = require("discord.js")
const fs = require("fs")
const path = require("path")

const commands = []
const commandsPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  commands.push(command.data.toJSON())
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN)
;(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`)

    let data

    // Check if we're in development or production
    if (process.env.NODE_ENV === "development" && process.env.GUILD_ID) {
      // In development, register commands to a specific guild for instant updates
      data = await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
        body: commands,
      })
      console.log(`Successfully reloaded ${data.length} guild (/) commands.`)
    } else {
      // In production, register global commands (takes up to an hour to propagate)
      data = await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
      console.log(`Successfully reloaded ${data.length} global (/) commands.`)
    }
  } catch (error) {
    console.error(error)
  }
})()
