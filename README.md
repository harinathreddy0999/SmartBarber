# 💼 SmartBarber: AI-Powered Barber Shop Booking App

![SmartBarber Logo](https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80)

---

## ✨ Overview

**SmartBarber** is a sleek, AI-powered barber shop booking application that reimagines the traditional grooming experience. Users can effortlessly:

- ✂️ **Book Appointments**
- 🧠 **Receive AI Hairstyle Recommendations**
- 💬 **Chat with a Smart Assistant**
- 💇‍♂️ **Explore Stylist Portfolios**

---

## 🚀 Features

- 🗓️ **Clean Appointment Booking Interface**  
  Calendar view with real-time availability of barbers

- 🧐 **AI Hairstyle Recommendations**  
  Upload photos, detect face shape, and get personalized style suggestions

- 🤖 **Intelligent Chatbot**  
  Handles FAQs, service details, and pricing queries

- 🧑‍🎨 **Stylist Profiles**  
  View stylist bios, specialties, and their portfolios

- 🎨 **Modern UI**  
  Deep blues, sharp whites, crimson accents—clean and professional

---

## 🧠 Mind Map

```
📀 SmartBarber App
    └️ Authentication
        └️ Home Screen
            └️ Main Features
                ├️ Booking
                ├️ AI Style Finder
                ├️ Chatbot Assistant
                └️ Stylist Profiles
                    └️ [Calendar, Upload, Analyze, Select, Checkout, Confirmation]
```

---

## 🛠️ Technology Stack

### 🗾️ Frontend
- **🔾 Language:** TypeScript
- **⚛️ Framework:** React.js + React Router
- **🎨 UI Components:** ShadCN UI (Radix-based)
- **🔀 Styling:** Tailwind CSS
- **🎮 Animations:** Framer Motion
- **📝 Forms:** React Hook Form + Zod

### 🔧 Backend
- **📈 Language:** Node.js (TypeScript)
- **🚀 Framework:** Express.js
- **💥 ORM:** Prisma (SQLite for dev, PostgreSQL for prod)
- **🔐 Auth:** JWT + bcrypt

### 🤖 AI Features
- 📸 Face Shape Detection
- 💇 Hairstyle Suggestion Engine
- 💬 Conversational Assistant (GPT-4 API)

---

## 📂 Project Structure

```
.
├── backend/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── server.ts
├── prisma/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── services/
│   └── main.tsx
└── package.json
```

---

## 🔪 Getting Started

### ✅ Prerequisites
- Node.js `v16+`
- npm / yarn

### 🔨 Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/smartbarber.git
   cd smartbarber
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Fill in your keys
   ```

4. **Setup Database**
   ```bash
   npx prisma migrate dev
   ```

5. **Run App**
   ```bash
   # Start backend
   npm run backend
   # Start frontend
   npm run dev
   ```

6. 🌐 Visit [`http://localhost:5173`](http://localhost:5173)

---

## ☁️ Deployment

- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway / Firebase Functions
- **Database**: Supabase / Railway PostgreSQL

---

## 🤝 Contributing

Want to improve SmartBarber?  
PRs, Issues, Ideas — **all welcome**!

```bash
# Fork → Code → PR → Merge! 🚀
```

---

## 📄 License

Licensed under the **MIT License**.  
See the `LICENSE` file for details.

---

## 🙏 Acknowledgments

- 🗋 [ShadCN UI](https://ui.shadcn.com/) – beautiful component system  
- 🎨 [Tailwind CSS](https://tailwindcss.com/) – utility-first magic  
- 📷 [Unsplash](https://unsplash.com/) – for the stunning imagery  
- 🤖 [OpenAI](https://platform.openai.com/) – GPT-4, the assistant brains

