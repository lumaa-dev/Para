const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
	data: {
		name: "mute",
		description: "Rendez quelqu'un muet",
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "membre",
				description: "Membre à rendre muet",
				type: ApplicationCommandOptionType.User,
				required: true,
			},
			{
				name: "raison",
				description: "La raison de cette action",
				type: ApplicationCommandOptionType.String,
				required: false,
			},
			{
				name: "heures",
				description: "Temps en heure du bannissement textuel",
				type: ApplicationCommandOptionType.Integer,
				required: false,
			},
			{
				name: "minutes",
				description: "Temps en minutes du bannissement textuel",
				type: ApplicationCommandOptionType.Integer,
				required: false,
			}
		],
	},
	customData: {
		category: "mods",
		dev: false,
		help: {
			usage: "/mute [membre] [raison]*",
		},
	},
	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction, client = null) {
		if (interaction.memberPermissions.has([PermissionFlagsBits.MuteMembers])) {
			const member = interaction.options.getMember("membre");
			const reason = interaction.options.getString("raison") ?? "*Aucune raison donnée*";

			if (member.manageable !== true)
				return interaction.reply({
					ephemeral: true,
					embeds: [
						EmbedDescription(
							`<:cross:973972321280860210> Vous n'avez pas les permissions requise.`
						),
					],
				});
			muteRole = interaction.guild.roles.cache.find(
				(role) => role.name == "Mute"
			);
			createdRole = false;
			if (!muteRole || typeof muteRole === "undefined") {
				muteRole = await interaction.guild.roles.create({
					name: "Mute",
					color: "RED",
					hoist: true,
					mentionable: false,
					permissions: [PermissionFlagsBits.CreateInstantInvite, PermissionFlagsBits.Connect],
				});
				createdRole = true;
			}
			interaction.guild.channels.cache.forEach(async (_channel) => {
				if (
					_channel.type == "GUILD_TEXT" ||
					_channel.type == "GUILD_NEWS" ||
					_channel.type == "GUILD_STORE" ||
					_channel.type == "GUILD_CATEGORY"
				) {
					
					await _channel.permissionOverwrites.create(
						muteRole,
						{
							SendMessages: false,
							AddReactions: false,
							UsePublicTheads: false,
							UsePrivateThreads: false,
						},
						{ type: 0 }
					);
				} else if (
					_channel.type == "GUILD_VOICE" ||
					_channel.type == "GUILD_STAGE_VOICE"
				) {
					await _channel.permissionOverwrites.create(
						muteRole,
						{ Speak: false, Stream: false, RequestToSpeak: false },
						{ type: 0 }
					);
				}
			});
			if (member.roles.cache.has(muteRole.id) == true)
				return interaction.reply({
					ephemeral: true,
					embeds: [
						EmbedDescription(
							`<:cross:973972321280860210> <@${member.user.id}> est déjà muet.`
						),
					],
				});
			member.roles.add(muteRole);
			const muteEmbed = new EmbedBuilder()
				.setTitle(
					`<:check:973972321436065802> ${member.user.username} à été mis en sourdine`
				)
				.setFooter({
					text: `Rôle créé : ${createdRole ? `Oui, (${muteRole.id})` : `Non`}`,
				})
				.addField("Membre muet :", `<@${member.user.id}>`, true)
				.addField("Rendu muet par :", `<@${interaction.member.user.id}>`, true)
				.addField("Rôle ajouté :", `<@&${muteRole.id}>`, true)
				.addField("Raison :", reason.trim())
				.setColor("RED");

			interaction.reply({ embeds: [muteEmbed] });
		} else {
			interaction.reply({
				ephemeral: true,
				embeds: [
					EmbedDescription(
						`<:cross:973972321280860210> Vous n'avez pas les permissions requise.`
					),
				],
			});
		}
		/**
		 * Mute Embed with custom description
		 * @param {String} description
		 * @returns {EmbedBuilder}
		 */
		function EmbedDescription(description) {
			return (
				new EmbedBuilder()
					//.setTitle("Mute")
					.setDescription(description)
					.setColor("RED")
			);
		}
	},
};
