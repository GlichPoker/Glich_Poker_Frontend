# Glitch Poker Frontend

## Introduction

**Glitch Poker** is an online poker application focused on delivering a **customizable poker experience**. Our goal is to provide a platform where users can enjoy classic poker with the flexibility to add custom rules, experience weather-based maps with special actions and use social features like friends and chat.

Only **authenticated users** can join games, create lobbies and challange friends. Lobby creators have the power to define custom rules, adjust hand rankings, and even apply special rules based on real-world weather. We built Glitch Poker to offer a more versatile poker experience than existing platforms.

## Technologies Used

* **Frontend:** 
  * React with Next.js framework
  * TypeScript 
  * Ant Design component library for UI elements
  * Tailwind CSS for styling
* **State & Data:** 
  * REST API for data fetching and updates
  * WebSockets for real-time game events and chat
* **Special Features:**
  * Integration of weather API for dynamic game environments
  * Deck of Cards API for card visualization

## High-Level Components

* **Lobby Management:** Handles the creation, listing, and joining of game lobbies.
    * [Lobby List Component](app/components/main/lobbyList.tsx)

* **Game Table & Gameplay:** Renders the poker table, manages in-game actions, and applies custom/weather rules.
    * [In-Game Layout](app/components/game/inGameLayout.tsx)

* **Friends & Social:** Allows users to add friends, view their status and stats, and invite them to games.
    * [User Profile Card](app/components/friends/UserProfileCard.tsx)

* **Leaderboard & Statistics:** Displays global and friends-only leaderboards with selectable poker stats.
    * [Leaderboard](app/components/main/leaderboard/leaderboard.tsx)

* **Custom Rules & Special Actions:** Supports hand rankings and weather-based maps / special actions.
    * [Create Lobby Page](app/main/create-lobby/page.tsx)



## Launch & Deployment

### Prerequisites
* Backend server running (see [backend repo](https://github.com/GlichPoker/Glich_Poker_Backend))
* Postgres db for data storage

### Setup Steps
1.  **Install dependencies:**
    ```sh
    npm install
    ```
2.  **Run the development server:**
    ```sh
    npm run dev
    ```
3.  **Build for production:**
    ```sh
    npm run build
    npm start
    ```
4.  **External Dependencies:** Requires the backend server to be running in order to establish a websocket connection.


## Illustrations
1. Landing Page
   * Users must register or login by clicking on the enter button to access game and main page functionalities.
![landingPage](public/images/screenshot/landingPage.png)

2. Main Page
   * **Game Rule**: This section explains the basic rules of poker, along with the custom rules and special effects specific to Glitch Poker. 
   * **Friends Section & Chat**: Users can click on existing users to view and manage their friendstatus. There is a friendlist to manage friends and view their stats. Users can use the chat to communicate with others. 
   * **Lobby List**: Players can join existing lobbies or create their own. 
   * **Leaderboard** : Displays the scores of all players or only friends.
![mainPage](public/images/screenshot/mainPage.png)

3. Create Lobby
   * When creating a lobby, the player can select custom rules.
   * Based on the host's location, the weather and weather-based rules are automatically applied.(Players can change weather-based rules through voting.) There is also a default map for normal rounds of poker without weather based rules.
   * The host is able to create public or privat lobbies. Private lobbies can only be accessed by entering the correct password or by an invitation by the lobby leader.
![createLobby](public/images/screenshot/createLobby.png)

4. In-game
   * The players are able to use nomal poker actions and special actions, which are determined by the map type.
   * The image of the game table switches according to the predetermined weather.
   * A maximum of 5 players can play in one lobby at the same time. 
![inGame](public/images/screenshot/inGame_sunny.png)



## Roadmap
* **In-game Text Chat:** Add chat functions within each lobby so players can communicate during the game.
* **Mobile Support:** Improve UI/UX for mobile devices.
* **More Special Rules** There are more non implemented [SPECIALRULES.md](SPECIALRULES.md).
* **UI Improvments** The pokertables, seats, special effects and interactions with components could be improved.


## Authors & Acknowledgement
| Contributors | Main Focus |
|------|--------|
| [Ahreum Oh](https://github.com/arden333) | Frontend |
| [Noé Brunner](https://github.com/RealBluSwan) | Frontend |
| [Elio Kuster](https://github.com/elio42) | Backend |
| [Gian Gerber	](https://github.com/BeCre11how) | Backend |

We'd like to thank our TA, Timon Leupp for guidance and support throughout the development of this project as part of the Software Engineering Lab course at the University of Zurich.

---

## License
Apache 2.0