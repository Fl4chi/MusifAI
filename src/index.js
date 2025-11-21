import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Load commands from src/commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    
    if (command.default.data && command.default.execute) {
      client.commands.set(command.default.data.name, command.default);
      console.log(`✅ Comando caricato: ${command.default.data.name}`);
    }
  }
}

client.once('ready', () => {
  console.log(`🎵 MusifAI Bot avviato come ${client.user.tag}`);
  console.log(`🔗 Collegato a ${client.guilds.cache.size} server`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  const command = client.commands.get(interaction.commandName);
  
  if (!command) {
    console.error(`⚠️ Comando non trovato: ${interaction.commandName}`);
    return;
  }
  
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione del comando:', error);
    await interaction.reply({
      content: '❌ Si è verificato un errore durante l\'esecuzione del comando.',
      ephemeral: true,
    });
  }
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

client.login(process.env.DISCORD_TOKEN);
