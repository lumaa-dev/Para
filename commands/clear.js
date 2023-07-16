const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
    /**@type {ApplicationCommand} */
	data: {
		name: "clear",
		description: "Videz un salon",
		defaultMemberPermissions: [PermissionFlagsBits.ManageChannels],
		options: [
			{
				name: "channel",
				description: "Nom de l'évènement",
				required: false,
				type: ApplicationCommandOptionType.Channel,
			}
		],
	},
	customData: {
		category: "mods",
		dev: false,
		help: {
			usage: "/clear [channel]*",
		},
	},
    async execute(interaction) {
        if (interaction.member.permissions.has([PermissionFlagsBits.ManageChannels])) {
            const _channel =
                interaction.options.get("channel")?.channel ?? interaction.channel;
            const clearedChannel = await _channel.clone({
                position: _channel.rawPosition,
            });
            _channel.delete();

            const timestamp = new Date().getTime() * (10) ** -3;
            const newChannelEmbed = new EmbedBuilder()
                .setTitle("Salon vidé.")
                .setDescription(
                    `Vidé par <@${
                        interaction.member.user.id
                    }> <t:${timestamp.toFixed(0)}:R>`
                )
                .setColor("Random");
            clearedChannel.send({ embeds: [newChannelEmbed] });
        }
    }
}