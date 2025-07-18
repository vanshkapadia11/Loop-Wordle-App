# 🟩 Multiplayer Wordle Game 🟨🟥

A real-time multiplayer clone of the popular Wordle game — built using **React** and **Firebase**. Compete with your friends live by creating or joining a game using Game IDs!

---

## 🚀 Features

- 🔐 **Authentication** – Login/signup using Firebase Auth
- 👥 **Multiplayer Support** – Create or join games via unique Game IDs
- 🔄 **Real-Time Sync** – Firebase Firestore handles live game state updates
- 🎯 **Guess Logic** – Wordle-style coloring and guess tracking
- 🏆 **Winner Detection** – Game ends when a player guesses the word
- 📄 **Rematch System** – Request and accept rematches after a game ends
- 🧑‍🤝‍🧑 **Opponent Name Display** – See your opponent’s name during the game
- ⌛ **Rematch Timer** – 10s timeout if rematch not accepted in time
- ✨ **Clean UI** – Styled using Tailwind CSS

---

## 🛠️ Tech Stack

- **Frontend:** React.js (with hooks + router)
- **Styling:** Tailwind CSS
- **Backend & Auth:** Firebase (Auth, Firestore)
- **Realtime Sync:** Firebase `onSnapshot`
