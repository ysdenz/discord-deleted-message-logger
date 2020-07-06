const translate = require('@vitalets/google-translate-api');
const { stripIndents } = require('common-tags');
const { Client, MessageEmbed } = require('discord.js');
const lang = require('./languages.json');

const client = new Client({ disableEveryone: true });

require('dotenv').config()
const { LOGS_CHANNEL_ID, BOT_TOKEN, PREFIX } = process.env

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

client.on('message', async message => {
	if (message.author.bot) return;

	// for gif filter
	// const regexr = (msg) => {
	// 	if (msg.match(/https?:\/\/(.*|gyfcat.com)(\.gif)?/) && !message.member.hasPermission('MANAGE_EMOJIS')) {
	// 		try {
	// 			message.delete()
	// 			message.reply('GIF usage is exclusive to server boosters <:smirky:681481290721394702>')
	// 		} catch (error) {
	// 			console.log(error.message);
	// 		}
	// 	}
	// };
	// if (message.content) regexr(message.content)
	// if (message.attachments.size > 0) regexr(message.attachments.first().proxyURL)

	if (!message.content.startsWith(PREFIX)) return;
	const args = message.content.slice(PREFIX.length).trim().split(/ +/g);


	if (!args[1]) return;

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.avatarURL({ dynamic: true }))
			.setFooter('Powered by Google Translate', 'https://i.imgur.com/dFx7Xa0.png')
			.setTimestamp();

		if (args.length > 303) return message.channel.send(embed.setColor('#7a0909').setDescription('Character count limit (including spaces) is 300.'))

		await translate(args.slice(1).join(' '), { to: args[0] })
			.then(res => {
				Object.keys(lang).map(key => {
					if (key === args[0]) {
						to = lang[key].name;
					}
					if (key === res.from.language.iso) {
						from = lang[key].name;
					}
				});

				console.log(res);
				console.log(res.text);
				console.log(res.from.language.iso);

				message.channel.send(embed
					.setColor((message.member.displayHexColor === '#000000') ? '#fcf3f2' : message.member.displayHexColor)
					.setDescription(stripIndents`
					${ (res.from.text.autoCorrected || res.from.text.autoCorrected) ? `Did you mean "*${res.from.text.value}*"?` : ''}

					Detected Language: **${from}**
					${args.slice(1).join(' ')}

					To: **${to}**
					${res.text}

					To know more language codes [click here.](https://cloud.google.com/translate/docs/languages)
				`));

			})
			.catch(err => {
				message.channel.send(embed
					.setTitle('Click me to view the Language Codes available')
					.setURL('https://cloud.google.com/translate/docs/languages')
					.setDescription(err.message)
					.setColor('#7a0909')
				);
			});
	
})

client.login(BOT_TOKEN)