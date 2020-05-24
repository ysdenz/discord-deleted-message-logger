const { stripIndents } = require('common-tags');
const { Client, MessageEmbed } = require('discord.js');
const client = new Client({ disableEveryone: true });

require('dotenv').config()
const { LOGS_CHANNEL_ID, BOT_TOKEN } = process.env

client.on('ready', () => { 
    console.log(`Bot online! ${client.user.username}`);
	client.user.setActivity('messages', { type: 'WATCHING' })
		.then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
		.catch(console.error);
})

client.on('messageDelete', async message => {
	if (message.author.bot) return;

	const logChannel =  await client.channels.fetch(LOGS_CHANNEL_ID)

    if (!logChannel) return;
    
	const embed = new MessageEmbed()
		.setColor('#000000')
		.setThumbnail(message.author.avatarURL({ dynamic: true }))
		.setTimestamp();

	let info = stripIndents` **Message Deleted**
			**- Member:** ${message.author.tag} (${message.author.id})
			**- Channel:** ${message.channel} (${message.channel.id})
			**- Message:** ${message.content}`

	if(message.attachments.array().length > 0) {
		const result = message.attachments.array()
		info += `\n[**Attached file found. Click here**](${result[0].proxyURL})`
	}
	logChannel.send(embed.setDescription(info))
})

client.login(BOT_TOKEN)