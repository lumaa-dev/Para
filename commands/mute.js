const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType, ApplicationCommand } = require("discord.js");

module.exports = {
    /**@type {ApplicationCommand} */
	data: {
		name: "mute",
		description: "Rendez quelqu'un muet",
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: [PermissionFlagsBits.MuteMembers, PermissionFlagsBits.ModerateMembers],
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
	async execute(interaction) {
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
					_channel.type == ChannelType.GuildText ||
					_channel.type == ChannelType.GuildAnnouncement ||
					_channel.type == ChannelType.GuildForum ||
					_channel.type == ChannelType.GuildCategory
				) {
					
					await _channel.permissionOverwrites.create(
						muteRole,
						{
							SendMessages: false,
							AddReactions: false,
							CreatePublicThreads: false,
							CreatePrivateThreads: false,
							UsePublicTheads: false,
							UsePrivateThreads: false,
						},
						{ type: 0 }
					);
				} else if (
					_channel.type == ChannelType.GuildVoice ||
					_channel.type == ChannelType.GuildStageVoice
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
				.addFields({ name: "Membre muet :", value: `<@${member.user.id}>`, inline: true })
				.addField({ name: "Rendu muet par :", value: `<@${interaction.member.user.id}>`, inline: true })
				.addField({ name: "Rôle ajouté :", value: `<@&${muteRole.id}>`, inline: true })
				.addField({ name: "Raison :", value: reason.trim() })
				.setColor();

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
