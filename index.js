require('dotenv').config();
const { Client } = require('nerimity.js'); // Kütüphane çağırma şekli güncellendi
const express = require('express');

const app = express();
app.get('/', (req, res) => { res.send('Bot is active.'); });
app.listen(process.env.PORT || 3000);

const client = new Client();

client.on('ready', () => {
    console.log(`Bot logged in: ${client.user.tag}`);
    // Slash komutu oluşturma kısmı kütüphaneye göre otomatikleşebilir
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'role-multiple') {
        const targetRole = interaction.options.getRole('role');
        const targetType = interaction.options.getString('type');
        await interaction.deferReply({ ephemeral: true });
        try {
            const members = await interaction.guild.members.fetch();
            let count = 0;
            for (const [id, member] of members) {
                let shouldAssign = (targetType === 'everyone') || (targetType === 'members' && !member.user.bot) || (targetType === 'bots' && member.user.bot);
                if (shouldAssign && !member.roles.cache.has(targetRole.id)) {
                    await member.roles.add(targetRole);
                    count++;
                }
            }
            await interaction.editReply(`Operation successful. ${count} users received the ${targetRole.name} role.`);
        } catch (err) { await interaction.editReply('Permission error. Check bot roles.'); }
    }
});

client.login(process.env.TOKEN);
