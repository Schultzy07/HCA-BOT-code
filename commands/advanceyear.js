const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '../data/contracts.json');

function loadContracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function saveContracts(contracts) {
  fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 2));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('advanceyear')
    .setDescription('Removes one year from all player contracts. Expired contracts become free agents.')
    .setDefaultMemberPermissions(0), // Restrict to admins or manual permission assignment

  async execute(interaction) {
    if (!interaction.memberPermissions.has('Administrator')) {
      await interaction.reply({ content: '❌ Only admins can use this command.', ephemeral: true });
      return;
    }

    const contracts = loadContracts();
    let expiredCount = 0;
    let updatedCount = 0;

    for (const player in contracts) {
      const contract = contracts[player];

      if (contract.years > 1) {
        contract.years -= 1;
        contract.salary = contract.aav * contract.years;
        updatedCount++;
      } else if (contract.years === 1) {
        contract.years = 0;
        contract.salary = 0;
        contract.team = "free agents";
        expiredCount++;
      }
    }

    saveContracts(contracts);

    await interaction.reply(
      `📉 Contract years advanced by 1.\n✅ Updated contracts: ${updatedCount}\n🏁 Moved to Free Agents: ${expiredCount}`
    );
  }
};
