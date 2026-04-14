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

