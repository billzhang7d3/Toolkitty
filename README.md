# Toolkitty
A Discord bot with a set of commands that I would find useful for myself, from image hosting to conversation summarization. This repo simply has the source code I have for the bot, excluding the Node modules.

## WORK IN PROGRESS

## USAGE
Clone the repo, and then run `npm install`. The PostgreSQL databases will require their own setup (specifically user creation), refer to the `.env` File Configuration below (the birthdays database will set itself up upon running the bot). For further reference on setting up a Discord bot, refer to [here](https://discordjs.guide/).

Run `node deploy-commands.js` and `node index.js` to run the bot.

## .env File Configuration
```
TOKEN="your token here"
CLIENT_ID="your client id here"
GUILD_ID="your main server here"

ARTWORK="your bot pfp image link here"
OPENAI_API_KEY="your openai api key here"
USERNAME1="your main here"
USERNAME2="your alt here"

DB_USER="your bot name here"
DB_PASS="your bot password here"
DB_HOST="localhost"

PLAN_DB_DATABASE="I don't know why, but"
GROCERY_DB_DATABASE="I have 2 separate DBs for these"
```
