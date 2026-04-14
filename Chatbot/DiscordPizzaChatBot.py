
import discord
import os
from dotenv import load_dotenv
import sys

load_dotenv("../.env")
sys.path.append("../")
from pizzaTechChatBot import chatbot, update_statuses


TOKEN = os.getenv("DISCORD_TOKEN")
PASSWORD = os.getenv("PASSWORD")
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": PASSWORD,
    "database": "pizza_db"
}

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

user_states = {

}

INTRO_MESSAGE = (
    "Bonjour, je suis **PizzaFlow**\n"
    "Je peux vous informer sur le statut, la préparation et la livraison de votre commande.\n"
    "Donnez-moi votre **numéro de commande** pour commencer."
)


@client.event
async def on_ready():
    print(f"Connected as {client.user}")


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    user_id = str(message.author.id)

    update_statuses()

    if user_id not in user_states:
        user_states[user_id] = {"order_id": None, "last_intent": None}
        await message.channel.send(INTRO_MESSAGE)
        return

    response = chatbot(message.content, user_states[user_id])
    await message.channel.send(response)

client.run(TOKEN)

# proposer a la carte

# les allergènes 

# commande