const Discord = require("discord.js");
const config = require("./functions/config.json");
const Func = require("./functions/all");
const { createClient } = require("./functions/js/client");
const { InteractionType } = require("discord.js");

const client = createClient([
	Discord.IntentsBitField.Flags.Guilds,
	Discord.IntentsBitField.Flags.GuildBans,
	Discord.IntentsBitField.Flags.GuildInvites,
	Discord.IntentsBitField.Flags.GuildMembers,

]);

client.once("ready", () => {
	console.log(`${client.user.tag} is logged`);
	//Func.Client.setStatus(client, "avec ses pouces");
});

client.on("messageCreate", async (message) => {
	Func.Commands.initiate(client, message);
});

client.on("interactionCreate", async (/**@type {Discord.Interaction}*/interaction) => {
	if (interaction.isChatInputCommand()) {
		let { commandName: name } = interaction;

		try {
			await require("./commands/" + name).execute(interaction);
		} catch (e) {
			if (interaction.deferred) {
				console.error(e);
				await interaction.editReply({ content: `Erreur:\n\`\`\`js\n${e}\`\`\`` });
			} else {
				console.error(e);
				await interaction.reply({ content: `Erreur:\n\`\`\`js\n${e}\`\`\`` });
			}
			
		}
	} else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
		let { commandName: name } = interaction;

		try {
			await require("./commands/" + name).completeAuto(interaction);
		} catch (e) {
			console.error(`Erreur:\n\`\`\`js\n${e}\`\`\``);
		}
	}
});

client.on("rateLimit", (detail) => {
	console.log(detail);
});

client.on("guildMemberAdd", async (member) => {
	if (!member.guild?.security) {
		member.guild.security = new Discord.Collection();
		member.guild.security = {
			count: 1,
			reset: function () {
				member.guild.security.count = 0;
				member.guild.security.timeout = undefined;
				member.guild.security.acted = false;
				console.log("Resetted guild security");
			},
			acted: false,
			timeout: undefined,
			joinedUsers: [],
		};
	} else {
		clearTimeout(member.guild.security.timeout)
		member.guild.security = {
			count: member.guild.security.count + 1,
			reset: function () {
				member.guild.security.count = 0;
				member.guild.security.timeout = undefined;
				member.guild.security.acted = false;
				console.log("Resetted guild security");
			},
			acted: false,
			timeout: setTimeout(
				() => ms.reset(),
				config.para.detectSecuritySec * 1000
			),
			joinedUsers: member.guild.security.joinedUsers.push(
				`${member.user.tag}/${member.id}`
			),
		};
	}

	const ms = member.guild.security;
	console.log(`warn in ${config.para.detectSecuritySec - ms.count}`);

	if (ms.count >= config.para.maxJoinUser) {
		clearTimeout(ms.timeout);
		await member.guild.invites.cache.each(async (invite) => {
			if (invite.deletable) {
				await invite.delete;
			} else {
				console.log("undeletable invite");
			}
		});
		ms.acted = true;
		sendPrivate(member.guild, {
			embeds: [
				new Discord.EmbedBuilder()
					.setTitle("Mesure de sécurité")
					.setDescription(
						"Nous avons dû supprimer la majoritée des invitations. La raison est : **Raid potentiel (10 nouveaux membres en 10 secondes).**\nSi vous pensez que cette action est une erreur, nous nous excusons."
					)
					.setColor("RED")
					.setFooter({ text: "ParaRaid 💪" }),
			],
		});
	} else if (typeof ms.timeout == "undefined") {
		console.log(`timed out in ${config.para.detectSecuritySec} seconds`);
		ms.timeout = setTimeout(
			() => ms.reset(),
			config.para.detectSecuritySec * 1000
		);
	}
});

client.on("channelDelete", async (/**@type {Discord.TextChannel} */ channel) => {
	const botRole = channel.guild.members.cache.get(client.user.id).roles.botRole;

	if (!channel.guild?.security) {
		channel.guild.security = new Discord.Collection();
		channel.guild.security = {
			count: 1,
			reset: function () {
				channel.guild.security.count = 0;
				channel.guild.security.timeout = undefined;
				channel.guild.security.acted = false;
				console.log("Resetted guild security");
			},
			acted: false,
			timeout: undefined,
		};
	} else {
		clearTimeout(channel.guild.security.timeout)
		channel.guild.security = {
			count: channel.guild.security.count + 1,
			reset: function () {
				channel.guild.security.count = 0;
				channel.guild.security.timeout = undefined;
				channel.guild.security.acted = false;
				console.log("Resetted guild security");
			},
			acted: false,
			timeout: setTimeout(
				() => cs.reset(),
				config.para.detectSecuritySec * 1000
			),
		};
	}

	const cs = channel.guild.security;
	console.log(`warn in ${config.para.detectSecuritySec - cs.count}`);

	if (cs.count >= config.para.maxDelChannel) {
		clearTimeout(cs.timeout);
		await channel.guild.roles.cache.each((role) => roleSecurity(role, botRole));
		cs.reset();
		sendPrivate(channel.guild, {
			embeds: [
				new Discord.EmbedBuilder()
					.setTitle("Mesure de sécurité")
					.setDescription(
						"Nous avons dû bloqué les permissions des rôles que j'ai pu modifié. La raison est : **Supprimé plus de 10 salons en 10 secondes.**\nSi vous pensez que cette action est une erreur, nous nous excusons."
					)
					.setColor("RED")
					.setFooter({ text: "ParaHack 💪" }),
			],
		});
	} else if (typeof cs.timeout == "undefined") {
		console.log(`timed out in ${config.para.detectSecuritySec} seconds`);
		cs.timeout = setTimeout(
			() => cs.reset(),
			config.para.detectSecuritySec * 1000
		);
	}
});

/**
 * It checks if the role is above the bot's role, and if it is, it sets the role's permissions to
 * nothing.
 * @param {Discord.Role} role - The role that was modified
 * @param {Discord.Role} botRole - The role of the bot
 */
async function roleSecurity(role, botRole) {
	if (role.position < botRole.position) {
		try {
			await role.setPermissions([], "Mesure de sécurité");
		} catch (e) {
			console.error("Couldn't change role id : " + role.id);
		}
	}
}

/**
 * It sends a message to the first channel it finds that has the VIEW_CHANNEL permission denied for the @everyone role.
 * @param {Discord.Guild} guild - The guild object
 * @param {Object|String} message - The message object.
 */
function sendPrivate(guild, message) {
	var done = false;
	guild.channels.cache.each(async (channel) => {
		if (done === true || channel.type !== "GUILD_TEXT") return;
		if (channel.permissionOverwrites.cache.first()?.id === guild.id) {
			const denyPermissions = channel.permissionOverwrites.cache.first().deny;
			if (denyPermissions.bitfield == 1024n) {
				done = true;
				return await channel.send(message);
			}
		}
	});

	if (done !== true) {
		guild.channels.cache.each(async (channel) => {
			if (done === true || channel.type !== "GUILD_TEXT") return;
			channel.send(message);
			done = true;
		});
	}
}

client.login(require("./functions/token.json").token);
