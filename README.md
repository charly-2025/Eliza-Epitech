# Eliza: a chatbot for pizzerias

> Built at **Epitech Rennes** · B-AIA-210 · Artificial Intelligence · April 2026

## Overview

A chatbot built around a real business need: pizzeria customers often call back to ask where their order is. **Eliza** (branded PizzaTech) automates that answer: customers enter their order number and get the order status and the remaining delivery time, computed with the GraphHopper API.

## Features

- Business analysis: target, pain points and goals (see `report.md`)
- Text-based chatbot and Discord bot
- Order tracking and delivery time estimation (GraphHopper)
- MySQL orders database
- Marketing landing page

## Tech stack

`Python` · `Discord API` · `MySQL` · `GraphHopper API` · `HTML / CSS / JS`

## Configuration

Required environment variables: `PASSWORD` (MySQL password) and `GRAPH_HOPPER` (GraphHopper API key).

No secret is committed: create your own local `.env` file.

---

## Technical documentation

### Project Overview

This project serves as an introduction to chatbot development. The goal of this project is to design a chatbot with a business focus one that serves a practical purpose within a company and integrates into the value chain. For our project, we chose to design a chatbot for a pizza restaurant that offers delivery. Today, in many pizzerias, customers call back after placing an order to check on its status and find out how long it will take to be delivered. Our chatbot automates this process by allowing customers to enter their order number and see the remaining delivery time.

--- 
### Installation and Local Run

```
Clone the project:
git clone https://github.com/charly-2025/Eliza-Epitech.git
cd Eliza-Epitech
```

#### Prerequisites

Make sure you have installed all python librairies in **requirement.txt**

#### Environment Variables

The backend and chatbot relies on the following environment variables:

```
PASSWORD = < your MYSQL secret password >
GRAPH_HOPPER = < your GRAP HOPPER api key>
```

#### Running the Project

For the chabbot in text-base interface :
```
cd Chabot
python3 pizzaTechChatBot.py
```
For the chabot on discord :
```
cd Chabot
python3 DiscordPizzaChatBot.py
```
click on the link : https://discord.com/oauth2/authorize?client_id=1490822253611450658
and install the bot on your server

For the landing page :
```
cd landing_page
./startup.sh
```
---
#### Justification of Technical Choices

 - We decided to build a chatbot using basic rules to ensure consistent responses. This also helps us stay focused and ensures that our chatbot only engages in and responds to conversations related to the company. Additionally, it allows us to have a lightweight and easily scalable system.
 
---
### Folders Structure

```
.
|-- Chatbot /
| |-- < The file for tun chabot on terminal and discord
|-- Landing_page /
  |-- < source code of the landing page website >

```

--- 
### Commit Convention
```
Format of the commit message: KARMA GIT

  <type>(<scope>): <subject>
  <BLANK LINE>
  <body>

USEFUL <type> : 
  [FEAT] #For adding a new "feature" for the user.
  [FIX] #For fixing a "feature" relevant to the user.
  [RM] #For removing a "feature" relevant to the user.
  [REFACTOR] #For refactoring production code, e.g. renaming a variable.
  [DOCS] #For changes to the documentation/.md etc.
  [BUILD] #For updating build configuration, development tools or other changes irrelevant to the user.
  [TEST] #For adding missing tests, refactoring tests; no production code change.

USEFUL <scope>:
  - Init
  - Documentation (.md)
  - Deployment
  - Code development
  - Figma

```
