
import discord
import os
from dotenv import load_dotenv
import sys

load_dotenv("../.env")
sys.path.append("../")
from pizzaTechChatBot import chatbot, update_statuses

# Load environment variables
TOKEN = os.getenv("DISCORD_TOKEN")
PASSWORD = os.getenv("PASSWORD")
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": PASSWORD,
    "database": "pizza_db"
}

# Discord bot creation with message content intent enabled
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# Dictionary to store user states for each user
user_states = {}

INTRO_MESSAGE = (
    "Bonjour, je suis PizzaTech\n"
    "Je peux vous informer sur le statut, la préparation et la livraison de votre commande.\n"
    "Donnez-moi votre numéro de commande pour commencer."
)


# Event handler for when the bot is ready
@client.event
async def on_ready():
    print(f"Connected as {client.user}")

# Event handler for incoming messages
@client.event
async def on_message(message):

    # Ignore messages sent by the bot itself
    if message.author == client.user:
        return

    user_id = str(message.author.id)

    update_statuses()

    # If the user is new, initialize their state and send the introduction message
    if user_id not in user_states:
        user_states[user_id] = {"order_id": None, "last_intent": None}
        await message.channel.send(INTRO_MESSAGE)
        return

    # Process the user's message through the chatbot function and send the response
    response = chatbot(message.content, user_states[user_id])
    await message.channel.send(response)

client.run(TOKEN)
