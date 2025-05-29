const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function loadUsers() {
  if (!fs.existsSync(usersPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(usersPath));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('myteam')
    .setDescription('Check which team you are currently managing.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const users = loadUsers();

    if (users[userId]) {
      const teamName = users[userId];
      await interaction.reply(`🏒 You are the GM of **${teamName.replace(/\b\w/g, l => l.toUpperCase())}**.`);
    } else {
      await interaction.reply("❌ You haven't set a team yet. Use `/setteam` to pick one.");
    }
  }
};
