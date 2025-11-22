import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import musicManager from './musicManager.js';
import logger from './utils/logger.js';

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
      logger.success(`Comando caricato: ${command.default.data.name}`);
    }
  }
}

client.once('ready', async () => {
  logger.success(`MusifAI Bot avviato come ${client.user.tag}`);
  logger.log(`Collegato a ${client.guilds.cache.size} server`);

  // Initialize Music Manager (Lavalink)
  try {
    await musicManager.init(client);
    logger.success('MusicManager inizializzato correttamente');
  } catch (error) {
    logger.error('Errore inizializzazione MusicManager', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    logger.warn(`Comando non trovato: ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Errore esecuzione comando ${interaction.commandName}`, error);
    const reply = {
      content: '❌ Si è verificato un errore durante l\'esecuzione del comando.',
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

client.login(process.env.DISCORD_TOKEN);
