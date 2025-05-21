const fs = require('fs').promises;
const path = require('path');

// Store conversation histories for different channels
const conversationHistories = new Map();

// Maximum number of messages to keep in memory per channel
const MAX_HISTORY_LENGTH = 50;

// Path to store conversation histories
const STORAGE_PATH = path.join(__dirname, '../data/conversations.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, '../data');
  try {
    await fs.access(dataDir);
    console.log('[DEBUG] Data directory exists:', dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    console.log('[DEBUG] Data directory created:', dataDir);
  }
}

// Load conversation histories from file
async function loadHistories() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(STORAGE_PATH, 'utf8');
    const histories = JSON.parse(data);
    for (const [channelId, history] of Object.entries(histories)) {
      conversationHistories.set(channelId, history);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error loading conversation histories:', error);
    }
  }
}

// Save conversation histories to file
async function saveHistories() {
  try {
    await ensureDataDirectory();
    const histories = Object.fromEntries(conversationHistories);
    await fs.writeFile(STORAGE_PATH, JSON.stringify(histories, null, 2));
    console.log('[DEBUG] Saved conversation histories to', STORAGE_PATH);
  } catch (error) {
    console.error('Error saving conversation histories:', error);
  }
}

// Add a message to the conversation history
async function addMessage(channelId, role, content) {
  console.log(`[DEBUG] Adding message to channel ", channelId, ":`, { role, content });
  if (!conversationHistories.has(channelId)) {
    conversationHistories.set(channelId, []);
  }

  const history = conversationHistories.get(channelId);
  history.push({ role, content });

  // Keep only the last MAX_HISTORY_LENGTH messages
  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift();
  }

  // Save to file after each update
  await saveHistories();
}

// Get the conversation history for a channel
function getHistory(channelId) {
  return conversationHistories.get(channelId) || [];
}

// Clear the conversation history for a channel
async function clearHistory(channelId) {
  conversationHistories.delete(channelId);
  await saveHistories();
}

// Initialize by loading saved histories
loadHistories().catch(console.error);

module.exports = {
  addMessage,
  getHistory,
  clearHistory
}; 