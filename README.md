ElderCare Companion

An AI-Powered Health & Wellness App for Seniors

ElderCare Companion is a web app created to help older adults stay healthy, connected, and independent.
It offers gentle reminders, health monitoring, and friendly AI chats—all in a simple, accessible design.

What It Does

Secure Login – Quick sign-up/sign-in with JWT authentication

Personal Dashboard – At-a-glance view of vitals, tasks, and reminders

Medication Manager – Schedule, edit, and track medications with smart notifications

Daily Tasks – Organize appointments and to-dos

Health Monitoring – Log heart rate, blood pressure, temperature, weight, and steps

Predictive Insights – AI flags potential health risks (Green / Yellow / Red)

AI Companion – A friendly chatbot for conversation and health guidance

Telemedicine – One-click Jitsi Meet video calls with doctors

Entertainment Zone – Music, news, and brain games for relaxation

Tech Stack

Frontend
React, Tailwind CSS, React Router, Axios, React Toastify, Lucide Icons

Backend
Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

External Services
Google AI (chatbot), Jitsi Meet (video calls), News API (optional)

Getting Started

Requirements

Node.js 14 or higher

MongoDB (local or Atlas)

Git

Setup

git clone <repo-url>
cd ElderCare
npm run install-all


Create a backend/config.env file:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/eldercare
JWT_SECRET=your_secret_key_here
GOOGLE_AI_API_KEY=your_google_ai_key
NEWS_API_KEY=your_news_api_key   # optional


Run MongoDB (local example):

mongod


Start the app:

npm run dev


Open:

Frontend: http://localhost:3000

Backend: http://localhost:5000

Demo login:
subhosreebanerjee.dms.154@gmail.com

password :123456

How to Use

Sign Up and Create Profile – Add health details and an emergency contact

Add Medications – Set dosage and times

Track Vitals – Log readings and watch trends

Chat with AI Companion – Ask health questions or just talk

Join a Video Call – One tap to start a doctor visit

Project Layout
ElderCare/
├── backend/       # Express server, models, routes
└── frontend/      # React components and pages

Security

JWT authentication

Password hashing with bcrypt

Input validation

Environment-based secrets (never hard-code keys)

Design for Seniors

Large fonts and buttons

High-contrast themes (light/dark/high-contrast)

Simple, predictable navigation

Fully responsive and touch-friendly

Health and Safety

Not for emergencies—call 911 for urgent care

AI provides guidance only, not professional medical advice

Maintenance

Health data refreshes every 30 seconds

Reminders and risk assessments update in real time

All data stored securely in MongoDB

Future Plans

Wearable-device integration

More detailed health analytics

Family notifications

Voice commands and multi-language support

Offline mode

Contribute

Fork the repository

Create a feature branch

Make and test changes

Submit a pull request
