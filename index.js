const Discord = require("discord.js");
const axios = require("axios");
const cheerio = require('cheerio');
const collage = require('collage');
const fs = require('fs');

const config = require("./config.json");



const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});
client.login(config.token);

client.on('message', message => {
  if(message.author.bot) return;

  if(message.content.includes('reactor.cc/post') && message.content.includes('http://')){
    const url = message.content.match(/http:\/\/[a-z./0-9]*/)[0];

    axios(url).then(async (res) => {
      const $ = cheerio.load(res.data);
      const images = [];

      $(".post_content").children('div').first().find('img').each((id, elem) => {
        const link = $(elem).attr("src");
        if(link) {
          images.push(link);
        }
      });

      $(".post_content")
        .children(".image")
        .find("img")
        .each((id, elem) => {
          const link = $(elem).attr("src");
          if (link) {
            images.push(link);
          }
        });

      if (images.length) {
        if(images.length === 1) {
          message.channel.send(images[0]);
        } else {
          collage({
            images,
            cols: (images.length > 9) ? 4 : 3,
            gap: 10,
          }).then((buffer) => {
            fs.writeFileSync("./collage.png", buffer);
            message.channel.send({
              files: [buffer],
            });
          });
        }        
      }
    });
  }

  

})
