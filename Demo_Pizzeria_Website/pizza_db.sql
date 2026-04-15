CREATE DATABASE IF NOT EXISTS pizza_db;
USE pizza_db;

CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    address TEXT NOT NULL,
    total_preparation_time INT,
    delivery_time INT,
    date_finish_preparation DATETIME,
    date_delivery DATETIME,
    status VARCHAR(50) DEFAULT 'preparation'
);

CREATE TABLE IF NOT EXISTS order_pizzas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    pizza_id INT,
    quantity INT DEFAULT 1,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS pizzas (
    pizza_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    preparation_time INT NOT NULL,
    price DECIMAL(6,2) NOT NULL
);

INSERT INTO pizzas (pizza_id, name, preparation_time, price) VALUES
(1, 'Margherita Tech', 10, 10.90),
(2, '4 Fromages 2.0', 12, 13.90),
(3, 'Reine du Code', 11, 13.50),
(4, 'Capricciosa Verde', 11, 12.90),
(5, 'Veggie Hack', 10, 12.50),
(6, 'Primavera Bot', 9, 11.90),
(7, 'AI Pepperoni', 13, 14.90),
(8, 'Pizza Dark Mode', 14, 15.90),
(9, 'Open Source', 15, 16.50);