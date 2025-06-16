# Pokémon Type Explorer

A dynamic web application built with React that allows users to explore and filter Pokémon by type, name, and other attributes. This app features a live search, interactive details modal, and a clean, responsive UI.

**Live Demo:** [**Link to your deployed site will go here!**]

## 📌 Overview

Pokémon Type Explorer is a tool for both casual fans and competitive players to quickly find Pokémon that match specific criteria. The app fetches data from the PokeAPI and presents it in a user-friendly way, including all official alternate forms (Alolan, Galarian, etc.) up to Generation 8.

## ✨ Key Features

- **Multi-Type Filtering:** Select one or two types to see only Pokémon that have both.
- **Live Search:** Instantly filter results by name, with "Did you mean...?" typo correction.
- **All Forms Included:** The search and type filters correctly include regional forms with different typings (e.g., Alolan Marowak).
- **Dynamic "Pokédex" Modal:** Click any Pokémon to view a detailed pop-up with:
  - Base Stats
  - Type Effectiveness (Weaknesses, Resistances, Immunities)
  - Evolution Chain
  - Other Alternate Forms
- **Pagination:** Handles large result sets gracefully with easy-to-use page controls.
- **Responsive Design:** A clean UI that works beautifully on both desktop and mobile devices.

## 🛠️ Tech Stack

- **Frontend:** React.js, JavaScript (ES6+), HTML5, CSS3
- **Styling:** Tailwind CSS
- **API:** [PokeAPI (v2)](https://pokeapi.co/)
- **Fuzzy Search:** Fuse.js
- **Deployment:** Netlify

## 🚀 How to Run Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

You need to have Node.js and npm installed on your machine.

### Installation

1. Clone the repo
   ```sh
   git clone [https://github.com/your-username/pokemon-type-explorer.git](https://github.com/your-username/pokemon-type-explorer.git)
