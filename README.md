# Tripzy - Travel Companion & Service Platform

A full-stack web application connecting tourists with travel companions and local service providers in Sri Lanka.

## Project Structure

```
TRIPZY FINAL/
├── frontend/          # React Vite app
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable components
│   │   └── api.js     # API integration
│   └── package.json
├── backend/           # PHP backend
│   ├── models/        # Database models
│   ├── config/        # Configuration files
│   ├── helpers/       # Helper utilities
│   └── index.php      # Entry point
├── database/          # Database schema
└── README.md
```

## Getting Started

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access at: `http://localhost:5173`

### Backend Setup

1. Place the `backend/` folder in your web server (XAMPP: `htdocs/`)
2. Configure database in `backend/config/db.php`
3. Access at: `http://localhost/tripzy/backend/index.php`

### Database Setup

1. Create a MySQL database
2. Run the schema from `database/schema.sql`
3. Update connection details in `backend/config/db.php`

## Features

- 🧑‍🤝‍🧑 Travel Companion Finder
- 🏨 Service Provider Listings
- 📱 User Authentication
- 💬 Messaging System
- ⭐ Rating & Reviews

## Environment Variables

Create a `.env` file in the root:

```
VITE_API_BASE_URL=http://localhost/tripzy/backend
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=tripzy
```

## Tech Stack

- **Frontend:** React + Vite + Bootstrap
- **Backend:** PHP + MySQL
- **Deployment:** XAMPP (local) or production server

## Development Notes

- Session files excluded from version control (see `.gitignore`)
- Upload directories are runtime-generated
- Test files in `backend/tests/` (when added)

---

For issues or contributions, please contact the development team.
