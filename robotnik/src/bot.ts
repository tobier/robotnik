import { RichEmbed, Guild, TextChannel } from 'discord.js';
import { HelixStream, HelixStreamType } from 'twitch';

export default class Bot {
  guild: Guild;

  constructor(guild: Guild) {
    this.guild = guild;
  }

  onStreamChanged(stream: HelixStream): void {
    if (stream.type === HelixStreamType.Live) {
      stream.getUser().then((user) => {
        const author = stream.userDisplayName;
        const avatar = user.profilePictureUrl;
        stream.getGame().then((game) => {
          const shillChannel = this.guild.channels.find((channel) => channel.name === 'streams'
            && channel instanceof TextChannel) as TextChannel;
          if (shillChannel) {
            const shill = new RichEmbed()
              .setAuthor(author, avatar, `https://twitch.tv/${user.name}`)
              .setColor('#0099ff')
              .setTitle(game.name)
              .setDescription(stream.title)
              .setThumbnail(game.boxArtUrl);
            shillChannel.send(shill);
          }
        });
      });
    }
  }
}
