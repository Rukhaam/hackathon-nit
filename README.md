# 🚀 LocalHub: Intelligent Local Services Marketplace

LocalHub is a next-generation platform connecting customers with trusted, verified local professionals (plumbers, electricians, tutors, etc.). Moving beyond traditional directories, LocalHub leverages advanced AI to provide natural language searching, automated profile generation, and live web-scraped market price estimations.
PROJECT LINK :
https://localhubservice.vercel.app/

## ✨ Key Features

### 👤 For Customers (Users)
* **Natural Language "Smart Search"**: Describe your problem naturally (e.g., *"My kitchen sink is leaking in Srinagar"*) and the AI will instantly route you to the correct category and city.
* **AI Fair Price Estimator**: Before booking, check live market rates. The app scours the web in real-time to tell you if the provider's base price is fair.
* **Seamless Booking**: Request services, pick a scheduled date, and leave detailed notes.
* **Ratings & Reviews**: Leave feedback and view average ratings and reviews for providers.

### 💼 For Professionals (Providers)
* **AI "Magic Write" Bios**: Providers who struggle with writing can instantly generate high-converting, professional bios tailored to their specific service category.
* **Secure Document Verification**: Drag-and-drop PDF upload for CVs and Aadhaar cards (ID verification) to build customer trust.
* **Duty Status Toggle**: Instantly switch between "Online ✅" and "Offline 🛑" to control visibility in the search results.
* **Provider Dashboard**: Manage incoming bookings, update base prices, and control service areas.

### 🛡️ For Administrators
* **Document Review Modal**: A built-in PDF viewer to securely check uploaded Aadhaar cards and CVs without downloading them.
* **One-Click Approvals**: Approve or reject provider verification requests to maintain platform quality.
* **User Management**: View all users, monitor platform bookings, and suspend/activate accounts with a single click.

---

## 🧠 Advanced AI Integrations

This project doesn't just use AI as a gimmick; it uses it to solve real marketplace friction points:

1. **The "Brain" (Google Gemini 2.5 Flash)**
   * Parses messy, human sentences into clean JSON routing data (`{category: "Plumber", city: "Srinagar"}`).
   * Writes professional bios for service providers based on their category.
   * Synthesizes scraped web data into readable, 2-sentence market summaries.

2. **The "Scout" (Exa AI Neural Search)**
   * Acts as a live search engine for the **Fair Price Estimator**.
   * Searches the internet in real-time for *"average hourly rate for an Electrician in [City]"*, fetches the text from the top 3 websites, and feeds it to Gemini to ensure users never overpay.

---

## 💻 Tech Stack

**Frontend:**
* React.js (Vite)
* Redux Toolkit (State Management)
* Tailwind CSS (Styling & Animations)
* Lucide React (Icons)
* React-Select (Async location dropdowns)
* Axios (API communication)

**Backend:**
* Node.js & Express.js
* MySQL (Database)
* Multer (Multipart/form-data handling for PDF uploads)
* JSON Web Tokens (JWT) & bcrypt (Authentication/Security)

**APIs & Services:**
* Google Generative AI SDK (`@google/genai`)
* Exa JS SDK (`exa-js`)
* Geoapify API (Location autocomplete)

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v16+)
* MySQL Server
* API Keys for Gemini, Exa AI, and Geoapify

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/localhub.git](https://github.com/yourusername/localhub.git)

2.
Setup the Backend:

Bash
cd Backend
npm install
Create a .env file and add your database credentials, JWT_SECRET, GEMINI_API_KEY, and EXA_API_KEY.

Run the SQL scripts provided in the /database folder to set up your tables.

Start the server: npm run dev


3.
Setup the Frontend:

Bash
cd Frontend
npm install
Create a .env file and add VITE_GEOAPIFY_API_KEY.

Start the client: npm run dev


<div align="center">


<i>This project was proudly made for the hackathon at <b>NIT Srinagar</b>. 🎓🏔️</i>
</div>
