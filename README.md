# 📦 rasp-server

Servidor local para Raspberry Pi basado en contenedores Docker.  
Incluye un frontend en React, un backend en Node.js (Express + Socket.IO) y una base de datos MongoDB.

---

## 🚀 Tecnologías
- 🟦 **Frontend**: React.js + Nginx
- 🟩 **Backend**: Node.js + Express + Socket.IO
- 🍃 **Base de datos**: MongoDB
- 🐳 **Orquestación**: Docker + Docker Compose

---

## 📂 Estructura del proyecto
rasp-server/
├── .gitignore
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── data/ (Volumen de datos de MongoDB)
├── docker-compose.yml
├── frontend/ (Mencionado en README, sin archivos)
└── nginx/
    ├── conf.d/
    │   └── app.conf
    ├── nginx.conf
    └── snippets/
        ├── caching.conf
        ├── gzip.conf (No incluido en app.conf, pero presente)
        ├── proxy-params.conf
        └── security-headers.conf

---

## 🎯 Objetivo
Aprender y practicar una arquitectura moderna de despliegue local:  
- 🐳 Uso de Docker para aislar servicios.  
- 🌐 Servir una app web accesible en la red local.  
- 📡 Comunicación en tiempo real mediante WebSockets.

---

## 👤 Autor
Ismael