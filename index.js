require('dotenv').config();
console.log('Bot coded by Felix_Playz#1000\nLoaded Comfi v2.0');
//Defining dependencies
require('discord-reply');
const { Client, Collection } = require('discord.js');
const { PREFIX } = require('./config.js');
const discord = require('discord.js');
const moment = require('moment');
const ms = require('ms');
const pms = require('pretty-ms');
const { LeftImage, JoinImage } = require('./config.json');
const canvas = require('discord-canvas');
const Nuggies = require('nuggies')
const Distube = require("distube");
const Canvas = require('canvas');
const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const format = require(`humanize-duration`);
const fetch = require('node-fetch');
const config = require('./config.json');
const wb = require('quick.db');
const bot = new Client({
	disableMentions: 'everyone',
	partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});
const clientID = config.clientID; 
const clientSecret = config.clientSecret;
const { MessageButton } = require('discord-buttons');
require('discord-buttons')(bot);
Nuggies.buttonroles.clickbutton(bot, button)
const smartestchatbot = require('smartestchatbot');
const fs = require('fs');
const db = require('old-wio.db');
const emojis = require('./emojis.json');

bot.distube = new Distube(bot, {
  searchSongs: true,
  leaveOnFinish: false,
  leaveOnStop: false,
});

bot.commands = new Collection();
bot.aliases = new Collection();
bot.emotes = emojis;
bot.config = config;

['command'].forEach(handler => {
	require(`./handlers/${handler}`)(bot);
});

bot.queue2 = new Map();
bot.queue3 = new Map();
bot.queue = new Map();
bot.games = new Map();

bot.on('ready', () => {
	const botpresence = bot.config.activity;

	const active = botpresence
		.replace(/{server}/g, `${bot.guilds.cache.size}`)
		.replace(/{channels}/g, `${bot.channels.cache.size}`)
		.replace(
			/{users}/g,
			`${bot.guilds.cache.reduce(
				(users, value) => users + value.memberCount,
				0
			)}`
		)
		.replace(/{prefix}/g, `${PREFIX}`);

	const bottype = bot.config.type;

	bot.user.setPresence({
		status: bot.config.status,
		activity: {
			name: active,
			type: bottype
		}
	});
});

const Enmap = require('enmap');

bot.setups = new Enmap({ name: 'setups', dataDir: './databases/setups' });

bot.on('message', async message => {
	if (message.author.bot || !message.guild || message.webhookID) return;

	let Prefix = await db.fetch(`prefix_${message.guild.id}`);
	if (!Prefix) Prefix = PREFIX;

	const mentionRegex = RegExp(`^<@!?${bot.user.id}>$`);

	if (message.content.match(mentionRegex)) {
		message.channel.send(
			new Discord.MessageEmbed()
				.setThumbnail(`${message.author.displayAvatarURL({ dynamic: true })}`)
				.setDescription(
					`Hey <@${
						message.author.id
					}>, My prefix for this guild is \`\`\`${Prefix}\`\`\`.Use \`\`\`${Prefix}help\`\`\` or <@${
						bot.user.id
					}> help to get a list of commands`
				)
				.setColor('RANDOM')
				.setFooter(`Requested by ${message.author.username}`)
				.setTimestamp()
		);
	}

	if (db.has(`afk-${message.author.id}+${message.guild.id}`)) {
		const info = db.fetch(`afk-${message.author.id}+${message.guild.id}`);
		await db.delete(`afk-${message.author.id}+${message.guild.id}`);
		await db.delete(`aftime-${message.author.id}+${message.guild.id}`);
		message.channel.send(
			`Welcome back ${message.author.username}, Great to see you!!`
		);
	}
	//checking for mentions
	if (message.mentions.members.first()) {
		if (
			db.has(`afk-${message.mentions.members.first().id}+${message.guild.id}`)
		) {
			const reason = db.fetch(
				`afk-${message.mentions.members.first().id}+${message.guild.id}`
			);
			let time = db.fetch(
				`aftime-${message.mentions.members.first().id}+${message.guild.id}`
			);
			time = Date.now() - time;
			return message.channel.send(
				`**${
					message.mentions.members.first().user.username
				} is now afk - ${reason} - ${format(time)} ago**`
			);
		}
	}

	const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const prefixRegex = new RegExp(
		`^(<@!?${bot.user.id}>|${escapeRegex(Prefix)})\\s*`
	);

	if (!prefixRegex.test(message.content)) return;

	const [, matchedPrefix] = message.content.match(prefixRegex);
	Prefix = matchedPrefix;

	if (!message.content.startsWith(Prefix)) return;

	if (!message.guild.me.permissionsIn(message.channel).has('EMBED_LINKS'))
		return message.reply(
			'**:x: I am missing the Permission to `EMBED_LINKS`**'
		);

	let args = message.content
		.slice(matchedPrefix.length)
		.trim()
		.split(/ +/g);
	let cmd = args.shift().toLowerCase();

	if (cmd.length === 0) return;

	let cmdx = wb.fetch(`cmd_${message.guild.id}`);

	if (cmdx) {
		let cmdy = cmdx.find(x => x.name === cmd);
		if (cmdy)
			message.channel.send(
				cmdy.responce
					.replace(/{user}/g, `${message.author}`)

					.replace(/{user_tag}/g, `${message.author.tag}`)
					.replace(/{user_name}/g, `${message.author.username}`)
					.replace(/{user_ID}/g, `${message.author.id}`)
					.replace(/{guild_name}/g, `${message.guild.name}`)
					.replace(/{guild_ID}/g, `${message.guild.id}`)
					.replace(/{memberCount}/g, `${message.guild.memberCount}`)
					.replace(/{size}/g, `${message.guild.memberCount}`)
					.replace(/{guild}/g, `${message.guild.name}`)
					.replace(
						/{member_createdAtAgo}/g,
						`${moment(message.author.createdTimestamp).fromNow()}`
					)
					.replace(
						/{member_createdAt}/g,
						`${moment(message.author.createdAt).format(
							'MMMM Do YYYY, h:mm:ss a'
						)}`
					)
			);
	}

	let ops = {
		queue2: bot.queue2,
		queue: bot.queue,
		queue3: bot.queue3,
		games: bot.games
	};

	let command = bot.commands.get(cmd);
	// If none is found, try to find it by alias
	if (!command) command = bot.commands.get(bot.aliases.get(cmd));

	// If a command is finally found, run the command
	if (command) command.run(bot, message, args);
});

bot.on('message', async message => {
	let disabled = new MessageEmbed()
		.setColor('#FF0000')
		.setDescription('Chat Bot is disabled by the Owner in this Server!')
		.setFooter(`Requested by ${message.author.username}`);

	if (message.author.bot || !message.guild) return;
	bot.setups.ensure(
		message.guild.id,
		{
			enabled: false,
			channel: ''
		},
		'aichatsystem'
	);

const scb = new smartestchatbot.Client()

	let chatbot = bot.setups.get(message.guild.id, 'aichatsystem');

	if (message.channel.id == chatbot.channel) {
		if (!chatbot.enabled)
			return message.author.send(disabled).catch(e => console.log(e));

    if (message.author.bot) return;
    message.content = message.content.replace(/@(everyone)/gi, "everyone").replace(/@(here)/gi, "here");
    if (message.content.includes(`@`)) {
      return message.lineReply(`**:x: Please dont mention anyone**`);
    }
    message.channel.startTyping();
    if (!message.content) return message.lineReply("Please say something.");
    scb.chat({message: message.content, name: bot.user.username, owner:"Moonbow", user: message.author.id, language:"en"}).then(reply => { 
      message.lineReply(`${reply}`); 
      
    }) 
    message.channel.stopTyping(); 
	  
	}});


bot.on('guildMemberAdd', async member => {
	if (!member.guild) return;
	//autorole -->
	bot.setups.ensure(
		member.guild.id,
		{
			roles: []
		},
		'welcome'
	);

	let roles = bot.setups.get(member.guild.id, 'welcome.roles');

	if (roles.length >= 1) {
		for (let i = 0; i < roles.length; i++) {
			try {
				let roleadd = member.guild.roles.cache.get(roles[i]);
				member.roles.add(roleadd.id);
			} catch (e) {
				console.log(e);
			}
		}
	}
	let toggle = await db.fetch(`Weltog_${member.guild.id}`);
	let togEm = await db.fetch(`Welemtog_${member.guild.id}`);

	//code -->

	if (toggle === true) {
		if (togEm === true) {
			try {
				let sChannel = await db.fetch(`Welcome_${member.guild.id}_Channel`);
				if (!sChannel) return;
				let sMessage = await db.fetch(`Welcome_${member.guild.id}_Msg`);
				if (!sMessage) sMessage = `Welcome To The Server!`;
				let clr = await db.fetch(`Welcome_${member.guild.id}_Clr`);
				let wMessage = await db.fetch(`Welcome_${member.guild.id}_Ftr`);

				if (member.user.username.length > 25)
					member.user.username = member.user.username.slice(0, 25) + '...';
				if (member.guild.name.length > 15)
					member.guild.name = member.guild.name.slice(0, 15) + '...';

				let sMsg = sMessage
					.replace(/{user}/g, `${member}`)
					.replace(/{user_tag}/g, `${member.user.tag}`)
					.replace(/{user_name}/g, `${member.user.username}`)
					.replace(/{user_id}/g, `${member.id}`)
					.replace(/{server_name}/g, `${member.guild.name}`)
					.replace(/{server_id}/g, `${member.guild.id}`)
					.replace(/{membercount}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(
						/{user_createdAgo}/g,
						`${moment(member.user.createdTimestamp).fromNow()}`
					)
					.replace(
						/{user_createdAt}/g,
						`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`
					);


         let wMsg = wMessage
					.replace(/{membercount}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(
						/{user_createdAgo}/g,
						`${moment(member.user.createdTimestamp).fromNow()}`
					)
					.replace(
						/{user_createdAt}/g,
						`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`
					);


				const Embed = new MessageEmbed()
					.setDescription(sMsg)
					.setFooter(wMsg)
					.setThumbnail(`${member.user.displayAvatarURL()}`)
					.setColor(clr);
				return bot.channels.cache.get(sChannel).send(`${member.user} has joined <@&808639795491373087>`, { embed: Embed })
			} catch (e) {
				console.log(e);
			}
		} else {
			try {
				let Channel = await db.fetch(`Welcome_${member.guild.id}_Channel`);
				if (!Channel) return;
				let Message = await db.fetch(`Welcome_${member.guild.id}_Msg`);
				if (!Message) Message = `Welcome To The Server!`;
				let WelcomeImage = await db.fetch(`WelIm_${member.guild.id}`);

				if (member.user.username.length > 25)
					member.user.username = member.user.username.slice(0, 25) + '...';
				if (member.guild.name.length > 15)
					member.guild.name = member.guild.name.slice(0, 15) + '...';

				let Msg = Message.replace(/{user}/g, `${member}`)
					.replace(/{user_tag}/g, `${member.user.tag}`)
					.replace(/{user_name}/g, `${member.user.username}`)
					.replace(/{user_id}/g, `${member.id}`)
					.replace(/{server_name}/g, `${member.guild.name}`)
					.replace(/{server_id}/g, `${member.guild.id}`)
					.replace(/{membercount}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(
						/{user_createdAgo}/g,
						`${moment(member.user.createdTimestamp).fromNow()}`
					)
					.replace(
						/{user_createdAt}/g,
						`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`
					);

				let Welcomed = new canvas.Welcome();
				let Image = await Welcomed.setUsername(member.user.username)
					.setDiscriminator(member.user.discriminator)
					.setGuildName(member.guild.name)
					.setAvatar(
						member.user.displayAvatarURL({ dynamic: false, format: 'jpg' })
					)
					.setMemberCount(member.guild.memberCount)
					.setBackground(WelcomeImage || JoinImage)
					.toAttachment();

				let Attachment = new Discord.MessageAttachment(
					Image.toBuffer(),
					'Welcome.png'
				);
				return bot.channels.cache.get(Channel).send(Msg, Attachment);
			} catch (e) {
				console.log(e);
			}
		}
  console.log("error found")
	} else {
		return;
	}
});

bot.on('guildMemberRemove', async member => {
	let toggle = await db.fetch(`leavtog_${member.guild.id}`);
	let togEm = await db.fetch(`leavemtog_${member.guild.id}`);

	if (toggle === true) {
		if (togEm === true) {
			try {
				let sChannel = await db.fetch(`Leave_${member.guild.id}_Channel`);
				if (!sChannel) return;
				let sMessage = await db.fetch(`Leave_${member.guild.id}_Msg`);
				if (!sMessage)
					sMessage = `${member.user.username} Has Left The Server!`;
					let clr = await db.fetch(`Welcome_${member.guild.id}_Clr`);
					let wMessage = await db.fetch(`Welcome_${member.guild.id}_Ftr`);

				if (member.user.username.length > 25)
					member.user.username = member.user.username.slice(0, 25) + '...';
				if (member.guild.name.length > 15)
					member.guild.name = member.guild.name.slice(0, 15) + '...';

				let sMsg = sMessage
					.replace(/{user}/g, `${member}`)
					.replace(/{user_tag}/g, `${member.user.tag}`)
					.replace(/{user_name}/g, `${member.user.username}`)
					.replace(/{user_id}/g, `${member.id}`)
					.replace(/{server_name}/g, `${member.guild.name}`)
					.replace(/{server_id}/g, `${member.guild.id}`)
					.replace(/{membercount}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(
						/{user_createdAgo}/g,
						`${moment(member.user.createdTimestamp).fromNow()}`
					)
					.replace(
						/{user_createdAt}/g,
						`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`
					);


         let wMsg = wMessage
					.replace(/{membercount}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(
						/{user_createdAgo}/g,
						`${moment(member.user.createdTimestamp).fromNow()}`
					)
					.replace(
						/{user_createdAt}/g,
						`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`
					);


				const Embed = new MessageEmbed()
					.setDescription(sMsg)
					.setFooter(wMsg)
					.setThumbnail(`${member.user.displayAvatarURL()}`)
					.setColor(clr);
				return bot.channels.cache.get(sChannel).send(`{ embed: Embed }`);
			} catch (e) {
				console.log(e);
			}
		} else {
			try {
				let Channel = await db.fetch(`Leave_${member.guild.id}_Channel`);
				if (!Channel) return;
				let Message = await db.fetch(`Leave_${member.guild.id}_Msg`);
				if (!Message) Message = `${member.user.username} Has Left The Server!`;
				let LeaveImage = await db.fetch(`Leaveim_${member.guild.id}`);

				if (member.user.username.length > 25)
					member.user.username = member.user.username.slice(0, 25) + '...';
				if (member.guild.name.length > 15)
					member.guild.name = member.guild.name.slice(0, 15) + '...';

				let Msg = Message.replace(/{user}/g, `${member}`)
					.replace(/{user_tag}/g, `${member.user.tag}`)
					.replace(/{user_name}/g, `${member.user.username}`)
					.replace(/{user_id}/g, `${member.id}`)
					.replace(/{server_name}/g, `${member.guild.name}`)
					.replace(/{server_id}/g, `${member.guild.id}`)
					.replace(/{membercount}/g, `${member.guild.memberCount}`)
					.replace(/{guild}/g, `${member.guild.name}`)
					.replace(
						/{user_createdAgo}/g,
						`${moment(member.user.createdTimestamp).fromNow()}`
					)
					.replace(
						/{user_createdAt}/g,
						`${moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')}`
					);

				let Leaved = new canvas.Goodbye();
				let Image = await Leaved.setUsername(member.user.username)
					.setDiscriminator(member.user.discriminator)
					.setGuildName(member.guild.name)
					.setAvatar(
						member.user.displayAvatarURL({ dynamic: false, format: 'jpg' })
					)
					.setMemberCount(member.guild.memberCount)
					.setBackground(LeaveImage || LeftImage)
					.toAttachment();

				let Attachment = new Discord.MessageAttachment(
					Image.toBuffer(),
					'leave.png'
				);
				return bot.channels.cache.get(Channel).send(Msg, Attachment);
			} catch (e) {
				console.log(e);
			}
		}
	console.log("member left")
	} else {
		return;
	}
});

bot.on('guildMemberAdd', async member => {
	if (!member.guild) return;
	let age = await wb.get(`age.${member.guild.id}`);
	let logs = await wb.get(`logs.${member.guild.id}`);
	let punishment = wb.get(`punishment.${member.guild.id}`); {
		let day = Number(age);
		let x = Date.now() - member.user.createdAt;
		let created = Math.floor(x / 86400000);

		if (day >= created) {
			member[punishment](`Alt detected - Account younger than ${day} days`);
			let channel = await bot.channels.cache.get(logs);
			let embed = new discord.MessageEmbed()
				.setTitle(`Suspicious! Account age less than ${day} days`)
				.addField(`Member Username`, member.toString())
				.addField(`Member ID`, member.id)
				.addField(
					`Account Age`,
					moment(member.user.createdAt).format('MMMM Do YYYY, h:mm:ss a')
				)
				.addField(`Punishment`, punishment)
				.setColor('#FF0000')
				.setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }));
			if (channel) channel.send({ embed: embed });
		}
	}
});

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"
  }\` | Loop: \`${queue.repeatMode
    ? queue.repeatMode == 2
      ? "All Queue"
      : "This Song"
    : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

bot.distube
  .on("playSong", (message, queue, song) => {
    const playSongEmbed = new Discord.MessageEmbed()
      .setTitle('Started Playing')
      .setDescription(`[${song.name}](${song.url})`)
      .addField('**Views:**', song.views)
      .addField('**Duration:**', song.formattedDuration)
      .addField('**Status**', status(queue))
      .setThumbnail(song.thumbnail)
      .setColor("BLUE")
    message.channel.send(playSongEmbed)
  })
  .on("addSong", (message, queue, song) =>
    message.channel.send(
      `${bot.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    )
  )
  .on("playList", (message, queue, playlist, song) =>
    message.channel.send(
      `${bot.emotes.play} | Play \`${playlist.title}\` playlist (${playlist.total_items
      } songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration
      }\`\n${status(queue)}`
    )
  )
  .on("addList", (message, queue, playlist) =>
    message.channel.send(
      `${bot.emotes.success} | Added \`${playlist.title}\` playlist (${playlist.total_items
      } songs) to queue\n${status(queue)}`
    )
  )
  .on("empty", (message, queue, song) =>
  message.channel.send("Channel is empty. Leaving the channel")
  )
  .on("finish", (message, queue, song) =>
  message.channel.send("No more song in queue")
  )
  .on("error", (message, err) =>
    message.channel.send(
      `${bot.emotes.error} | An error encountered: ${err}`
    )
  );
  
  
  bot.on("guildCreate", (guild) => {
  const channelId = "867650282933583882";
  const channel = bot.channels.cache.get(channelId);
  if (!channel) return;
  const embed = new discord.MessageEmbed()
    .setTitle("Someone invited me!")
    .setDescription(
      `**Guild Name:** ${guild.name} (${guild.id})\n**Members:** ${guild.memberCount}`
    )
    .setTimestamp()
    .setColor("#F8B6D4")
    .setFooter(`I'm in ${bot.guilds.cache.size} Guilds Now!`);
  channel.send(embed);
});

bot.on("guildDelete", (guild) => {
  const channelId = "867650282933583882";
  const channel = bot.channels.cache.get(channelId);
  if (!channel) return;
  const embed = new discord.MessageEmbed()
    .setTitle("I got kicked!")
    .setDescription(
      `**Guild Name:** ${guild.name} (${guild.id})\n**Members:** ${guild.memberCount}`
    )
    .setTimestamp()
    .setColor("#F8B6D4")
    .setFooter(`I'm in ${bot.guilds.cache.size} Guilds Now!`);
  channel.send(embed);
});

 
bot.on('clickButton', async (button) => {
  if (button.id === 'inviteyes') { button.reply.defer() 
  
  const inviteyb = new discord.MessageEmbed() 
  .setTitle("Thanks for using the bot!") 
  .setDescription(`Here Is My Invite Links: \nServer Moderator: **[Click Me](https://discord.com/oauth2/authorize?client_id=${clientID}&scope=bot&permissions=2147483647)** \nServer Helper: **[Click Me](https://discord.com/oauth2/authorize?client_id=${clientID}&scope=bot&permissions=4294967287)** \n\nRecommended: **[Click Me](https://discord.com/oauth2/authorize?client_id=${clientID}&scope=bot&permissions=8589934591)**`)
  .setColor("GREEN"); 
  
  const joindsc = new MessageButton() .setStyle('url') 
  .setLabel(
    'Join Our Support Server!') 
    .setURL('https://discord.gg/remYPHCVgW'); 
  button.message.edit({button: joindsc, embed: inviteyb})
  
    
  }
  
  if(button.id === 'inviteno'){ button.reply.defer() 
  const noooyb = new discord.MessageEmbed() 
  .setTitle('Okay Then') 
  .setDescription('But Please Join Our Support Server!') 
  .setColor("RED"); 
  
  const joindsc = new MessageButton() 
  .setStyle('url') 
  .setLabel('Join Our Support Server!')
  .setURL('https://discord.gg/remYPHCVgW'); 
  button.message.edit({button: joindsc, embed: noooyb})
  }}); 


bot.on('createButtonCollector', async (button) => {
            if (button.id === '1') {
               await button.reply.defer();
               msg.edit({
                    embed: embed1,
                    components: [row, row2, row3],
                });
            
            }
            if (button.id === '2') {
                await button.reply.defer();
                msg.edit({
                    embed: embed2,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '3') {
                await button.reply.defer();
                msg.edit({
                    embed: embed3,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '4') {
             await button.reply.defer();
                msg.edit({
                    embed: embed4,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '5') {
              await button.reply.defer();
                msg.edit({
                    embed: embed5,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '6') {
             await button.reply.defer();
                msg.edit({
                    embed: embed6,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '7') {
             await button.reply.defer();
                msg.edit({
                    embed: embed7,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '8') {
             await button.reply.defer();
                msg.edit({
                    embed: embed8,
                    components: [row, row2, row3],
                });
            }
            if (button.id === '9') {
             await button.reply.defer();
                msg.edit({
                    embed: embed9,
                    components: [row, row2, row3],
                });
            }
        })

bot.on('clickButton', button => { 
  Nuggies.buttonroles.clickbutton(bot, button)}
  );

function parseMs(str) {
	const parts = str.split(' ');
	const msParts = parts.map(part => ms(part));
	if (msParts.includes(undefined)) return undefined;
	const res = msParts.reduce((a, b) => a + b);
	return res;
}

function decodeMs(num) {
	return pms(num);
}

bot.login(process.env.TOKEN);

//BOT CODED BY: Felix_PlaYz#1000
//DO NOT SHARE WITHOUT CREDITS!
