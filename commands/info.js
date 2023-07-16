const { ApplicationCommand, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder } = require("discord.js")

module.exports = {
    /**@type {ApplicationCommand} */
    data: {
        name: "info",
        description: "Obtenez des informations sur Para",
    },
	customData: {
		category: "else",
		dev: true,
		help: {
			usage: "/info",
			note: "Obtenez des informations détaillées sur Para.",
		},
	},
    /** 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute(interaction) {
        const pages = [
            new EmbedBuilder()
            .setTitle("Général")
            .setDescription("Ce bot de protection à été fait à la base pour être un simple bot de modération, par la suite, il deviendra ce qu'il est aujourd'hui : Un bot qui protège ses utilisateurs contre les raids et grief.\nIl est **fortement conseillé** de mettre le rôle de Para **au second plus haut** pour qu'il puisse empêcher tout type d'attaque.\nD'autres commandes diverses fut créées pendant le processus.\n\n- Par [Lumaa](https://lumaa.fr)"),
            new EmbedBuilder()
            .setTitle("Confidentialité")
            .setDescription("Para utilise plusieurs évènements simultanément pour pouvoir empêcher un raid ou un grief, les informations prises en général sont :\n- Le premier salon textuel privé du serveur pour contacter les modérateurs\n\nLes informations prises pour un anti-raid sont :\n- Le nombre de nouveaux arrivants toutes les 10 secondes\n- Le nom d'utilisateur et l'identifiant des nouveaux arrivants\n- Les invitations\n\nLes informations prises pour un anti-grief sont :\n- Les rôles modifiable par Para\n- Les salons supprimés toutes les 10 secondes\n\nToutes les informations que nous utilisons pour vous protéger sont **directement supprimés** même si il ne se passe rien d'alarmant ou si une action à dû être faite."),
            new EmbedBuilder()
            .setTitle("Open-Source")
            .setDescription("Le programme de Para est disponible à tous depuis le mois de janvier sur GitHub :\nhttps://github.com/lumaa-dev/Para")
            .setURL("https://github.com/lumaa-dev/Para")
        ]

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            page
            .setFooter({ text: `${i + 1}/${pages.length} - Par @lumaa_dev` })
            .setColor("Random")
        }

        interaction.reply({ embeds: pages })
    }
}