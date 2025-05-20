# Discord Bot

A Discord bot with AI capabilities built using discord.js.

## Features

- Slash commands: `/ping`, `/help`, `/info`, `/ask`, `/channel-setup`
- Traditional commands: `!ping`, `!help`, `!info`, `!ask`
- AI-powered responses using OpenAI
- Channel-specific AI behaviors

## Local Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your credentials (see `.env.example`)
4. Register slash commands: `npm run deploy-commands`
5. Start the bot: `npm start`

## Deployment on Render

This bot is configured for easy deployment on Render.

### Prerequisites

1. A [Render](https://render.com/) account
2. A Discord bot with token and client ID
3. An OpenAI API key

### Deployment Steps

1. Fork or clone this repository to your GitHub account
2. Log in to Render and create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Name: `discord-bot` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `DISCORD_BOT_TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord application client ID
   - `OPENAI_API_KEY`: Your OpenAI API key
6. Click "Create Web Service"
7. Wait for the deployment to complete

### Post-Deployment

After deployment, your bot should automatically:
1. Register slash commands globally (may take up to an hour to propagate)
2. Connect to Discord and start responding to commands

## Adding to Your Discord Server

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to OAuth2 > URL Generator
4. Select the following scopes:
   - `bot`
   - `applications.commands`
5. Select the following bot permissions:
   - `Send Messages`
   - `Read Message History`
   - `Use Slash Commands`
   - `Embed Links`
6. Copy the generated URL and open it in your browser
7. Select the server you want to add the bot to and authorize

## Commands

### Slash Commands

- `/help` - Display help information
- `/ping` - Check bot responsiveness and latency
- `/info` - Get information about the server
- `/ask [question]` - Ask the AI a question
- `/channel-setup` - Configure AI behavior for specific channels

### Text Commands

- `!help` - Display help information
- `!ping` - Check if the bot is responsive
- `!info` - Get server information
- `!ask [question]` - Ask the AI a question

## Customization

You can customize the bot's behavior by:
1. Adding new commands in the `commands` directory
2. Modifying the system prompts for different channels
3. Adding additional features to the main `index.js` file
