import unicodedata
import re
import mysql.connector
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
PASSWORD = os.getenv("PASSWORD")

# Conversation state to keep track of the current order and last detected intent
state = {
    "order_id": None,
    "last_intent": None
}


def normalize(text): # Normalize text by converting to lowercase and removing accents
    text = text.lower()
    text = unicodedata.normalize('NFD', text)
    return ''.join(c for c in text if unicodedata.category(c) != 'Mn')

# Intent patterns to detect user queries
INTENTS = {
    "order_status": [
        r"status",
        r"etat",
        r"ou.*est"
    ],
    "preparation_time": [
        r"preparation",
        r"temps de preparation",
        r"cuisson",
        r"prete"
    ],
    "delivery_time": [
        r"livr",        
        r"delivery",
        r"arrive",
        r"quand.*commande",
        r"serais? li",
    ],
    "negative_feedback": [
        r"non",
        r"pas ca",
        r"wrong"
    ],
    "change_order":[
        r"change.*commande",
        r"numero.*commande"
    ]
}

# Function to detect order ID from the user's message
def detect_order_id(message):
    match = re.search(r"\b\d{1,10}\b", message)
    return match.group(0) if match else None

# Function to detect the user's intent based on the message content
def detect_intent(message):
    message = normalize(message)

    for intent, patterns in INTENTS.items():
        for pattern in patterns:
            if re.search(pattern, message):
                return intent

    return None

# Function to retrieve order details from the database based on the order ID
def get_order(order_id):

    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password="Mysqldufutur35!",
        database="pizza_db"
    )

    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            status,
            date_finish_preparation,
            date_delivery
        FROM orders 
        WHERE order_id = %s
    """, (order_id,))

    order = cursor.fetchone()

    cursor.close()
    conn.close()

    if order is None:
        return None

    return {
        "id": order_id,
        "status": order[0],
        "date_finish_preparation": order[1],
        "date_delivery": order[2]
    }

# Function to calculate the remaining seconds until a target datetime
def get_seconds_remaining(target_datetime):
    if target_datetime is None:
        return None

    now = datetime.now()
    seconds = int((target_datetime - now).total_seconds())

    return max(seconds, 0)

# Function to format seconds into a day, hour, minute, second format
def format_time(seconds):
    hours, rem = divmod(seconds, 3600)
    minutes, seconds = divmod(rem, 60)

    parts = []

    if hours:
        parts.append(f"{hours}h")

    if minutes:
        parts.append(f"{minutes}min")

    if seconds and hours == 0:
        parts.append(f"{seconds}s")

    return " ".join(parts)

# Function to determine the remaining time for preparation or delivery based on the order status and user intent
def get_time_remaining(order, intent):

    prep = get_seconds_remaining(order["date_finish_preparation"])
    delivery = get_seconds_remaining(order["date_delivery"])

    if intent == "preparation_time":
        if prep and prep > 0:
            return {"stage": "preparation", "seconds": prep}
        if delivery and delivery > 0:
            return {"stage": "delivery", "seconds": delivery}
        return {"stage": "delivered", "seconds": 0}

    if intent == "delivery_time":
        if delivery and delivery > 0:
            return {"stage": "delivery", "seconds": delivery}
        return {"stage": "delivered", "seconds": 0}

    return {"stage": "unknown", "seconds": None}

# Function to update the statuses of all orders in the database based on the current time and their preparation/delivery times
def update_statuses():

    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=PASSWORD,
            database="pizza_db"
            )
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE orders
            SET status = CASE
                WHEN NOW() < date_finish_preparation THEN 'preparation'
                WHEN NOW() < date_delivery THEN 'en livraison'
                ELSE 'livree'
            END
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as e:
        print(f"Erreur update_statuses : {e}")

# Main chabot logic to process user messages
def chatbot(message, state):
    update_statuses()

    if state["order_id"] is None:
        order_id = detect_order_id(message)

        if order_id:
            state["order_id"] = order_id
            order = get_order(state["order_id"])
    
            if order is None:
                state["order_id"] = None
                return "Commande introuvable"
            
            return "Merci, Que souhaitez-vous savoir sur votre commande ?"
        
        return "Merci de me donner votre numéro de commande"

    order = get_order(state["order_id"])
    
    if order is None:
        state["order_id"] = None
        return "Commande introuvable"

    intent = detect_intent(message)
    state["last_intent"] = intent

    if intent == "preparation_time":
        result = get_time_remaining(order, intent)
        if result["stage"] == "preparation":
            return f"Il reste environ {format_time(result['seconds'])} de préparation."
        
        if result["stage"] == "delivery" : 
            return f"La préparation est déjà terminée. Vous serez livrée dans {format_time(result['seconds'])}"

        return "Votre commande a déjà été livrée."

    if intent == "delivery_time":
        result = get_time_remaining(order, intent)

        if result["stage"] == "delivery":
            return f"Votre commande sera livrée dans environ {format_time(result['seconds'])}."

        return "Votre commande a déjà été livrée."


    if intent == "order_status":
        return f"Le status de votre commande est {order['status']}"

    
    if intent == "change_order" :
        state["order_id"] = None
        return "Donnez moi votre numéro de commande"

    return "Je n'ai pas compris"


INTRO_MESSAGE = (
    "Bonjour, je suis un chatbot automatique.\n"
    "Je peux vous informer sur le statut, la préparation et la livraison de votre commande.\n"
    "Donnez moi votre numéro de commande"
)

if __name__ == "__main__":
    print("Bot:", INTRO_MESSAGE)

    while True:
        msg = input("Client: ")
        print("Bot:", chatbot(msg, state))