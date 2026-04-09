
import mysql.connector
from mysql.connector import Error
import time
import os
from dotenv import load_dotenv
import argparse


parser = argparse.ArgumentParser()
parser.add_argument('--update', action="store_true", help='launch orders update status')
args = parser.parse_args()


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
            return conn, conn.cursor()

    except Error as e:
        print(f"Error: {e}")
        return False

load_dotenv()
conn, cursor = create_link_db("pizza_db",os.getenv("PASSWORD"))

if args.update : 
    while True:
        cursor.execute("""
            UPDATE orders
        SET status = CASE
            WHEN NOW() < date_finish_preparation THEN 'preparation'
            WHEN NOW() < date_delivery THEN 'en livraison'
            ELSE 'livree'
        END
        """)
        
        conn.commit()
        print("Status mis à jour")
        time.sleep(300) 
