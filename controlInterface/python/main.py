import mysql.connector
from mysql.connector import Error
from routingpy import Graphhopper
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import argparse
from datetime import datetime, timedelta
from routingpy import exceptions


parser = argparse.ArgumentParser()
parser.add_argument('--back', action="store_true", help='launch api')
parser.add_argument("--pizza", action="store_true",help="lauch create new pizza")
args = parser.parse_args()


app = Flask(__name__)
CORS(app)

load_dotenv()
grap_hopper_api_key = os.getenv("GRAPH_HOPPER")
gh = Graphhopper(api_key= grap_hopper_api_key)

Epitech = [-1.6973159, 48.1250328]

def format_travel_time_str(travel_time):
    duration = str(travel_time) + " seconds"

    if travel_time > 60 :
        seconds = travel_time
        minutes, remaining_seconds = divmod(seconds, 60)
        if minutes < 60 :
            duration = f"{minutes} minutes and {remaining_seconds} seconds"
        else :
            hours, remaining_minutes = divmod(minutes,60)
            duration = f"{hours} hours, {remaining_minutes} minutes and {remaining_seconds} seconds"

    return duration

def format_travel_time_int(travel_time):
    duration = [travel_time]

    if travel_time > 60 :
        seconds = travel_time
        minutes, remaining_seconds = divmod(seconds, 60)
        if minutes < 60 :
            duration = [minutes,remaining_seconds]
        else :
            hours, remaining_minutes = divmod(minutes,60)
            duration = [hours,remaining_minutes,remaining_seconds]

    return duration


def create_link_db(db_name,password) : 
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password=password,
            database=db_name
        )

        if conn.is_connected():

            print("connectin succesfull")

            # cursor.execute("SHOW TABLES")
            
            # # Fetch results
            # rows = cursor.fetchall()
            # for row in rows:
            #     print(row)
            
            # # Execute a query
            # cursor.execute(f"Describe order_pizzas")

            # rows = cursor.fetchall()
            # for row in rows:
            #     print(row)

            return conn, conn.cursor()

    except Error as e:
        print(f"Error: {e}")
        return False

def get_delivery_time(start_point,end_point):

    locations = [start_point, end_point]

    route = gh.directions(locations=locations, profile='car')

    travel_time = route.duration + 120

    return travel_time

def get_pizzas_name(list_pizzas_id,cursor):
    list_pizzas_name = []
    
    for pizza_id in list_pizzas_id : 
        cursor.execute("SELECT name FROM pizzas WHERE pizza_id = %s",(pizza_id,))
        list_pizzas_name.append(cursor.fetchone()[0])
    
    return list_pizzas_name


def get_pizzas_preparation(list_pizzas_id,cursor):
    pizzas_time_preparation = 0
    
    for pizza_id in list_pizzas_id : 
        cursor.execute("SELECT preparation_time FROM pizzas WHERE pizza_id = %s",(pizza_id,))
        pizzas_time_preparation += cursor.fetchone()[0]
    
    return pizzas_time_preparation

def insert_new_pizza(cursor,pizza_name,preparation_time,price):
    cursor.execute("INSERT INTO pizzas (name,preparation_time,price) VALUES (%s,%s,%s)",(pizza_name,preparation_time,price,))


def get_all_pizzas(cursor):
    cursor.execute("SELECT * FROM pizzas")
    return cursor.fetchall()


@app.route("/timetravel", methods=["POST"])
def get_route():
    data = request.json
    end = data["destination"]  # [lon, lat]

    locations = [Epitech, end]

    try:
        route = gh.directions(locations=locations, profile='car')

        travel_time = route.duration + 120
        distance = route.distance

        return jsonify({
            "success": True,
            "duration": format_travel_time_int(travel_time),
            "distance": distance
        })

    except exceptions.RouterApiError:
        return jsonify({
            "success": False,
            "error": "livraison impossible"
        }), 400


@app.route("/newcommand", methods=["POST"])
def newCommand():
    data = request.json

    name = data["name"]
    pizzas = data["pizzas"]
    coords = data["coords"]
    address = data["address"]
    email = data["email"]
    phone = data["phone"]


    con,cursor = create_link_db("pizza_db",os.getenv("PASSWORD"))

    preparation_time = get_pizzas_preparation(pizzas,cursor)
    delivery_time = get_delivery_time(Epitech,coords)+120

    now = datetime.now()
    date_finish_preparation = now + timedelta(minutes=preparation_time)
    date_delivery = date_finish_preparation + timedelta(seconds=delivery_time)



    cursor.execute("INSERT INTO orders (customer_name,email,phone_number,order_date,address,total_preparation_time,delivery_time,date_finish_preparation,date_delivery) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",(name,email,phone,now,address,preparation_time,delivery_time,date_finish_preparation,date_delivery,))
    
    order_id = cursor.lastrowid

    for pizza in pizzas : 
        cursor.execute("INSERT INTO order_pizzas (order_id, pizza_id, quantity) VALUES (%s, %s, %s)",(order_id,pizza,1))

    con.commit()
    con.close()
    cursor.close()

    return jsonify({
        "result" : "succes"
    })

@app.route("/get_pizzas", methods=["GET"])
def get_pizzas():
    conn, cursor = create_link_db("pizza_db",os.getenv("PASSWORD"))
    pizzas = get_all_pizzas(cursor)
    conn.close()
    return pizzas

if args.pizza :
    conn,link = create_link_db("pizza_db",os.getenv("PASSWORD"))

    pizza_name = str(input("Enter a name for the new pizza : "))
    preparation_time = int(input("Enter the pizza preparation time in min : "))
    price = int(input("Enter pizza price : "))

    insert_new_pizza(link,pizza_name,preparation_time,price)

    conn.commit()
    link.close()
    conn.close()

    print("New pizza added !")

if __name__ == "__main__" and args.back:
    app.run(debug=True)




