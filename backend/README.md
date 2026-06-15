# 🎵 Spotify Clone Backend

A production-ready REST API for a Spotify-like music streaming application built with **Node.js**, **Express.js**, **MongoDB Atlas**, and **Cloudinary**.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Multer | File upload handling |
| Cloudinary | Cloud image storage |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| Morgan | HTTP request logging |
| express-validator | Input validation |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── cloudinary.js           # Cloudinary configuration
│   ├── controllers/
│   │   ├── auth.controller.js      # Register, Login, Favorites, Recently Played
│   │   ├── song.controller.js      # CRUD + Upload + Pagination + Filtering
│   │   ├── playlist.controller.js  # CRUD + Details
│   │   └── user.controller.js      # Profile Get/Update
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── upload.middleware.js    # Multer + image filter
│   │   ├── validation.middleware.js# express-validator rules
│   │   └── error.middleware.js     # Global error handler
│   ├── models/
│   │   ├── user.model.js
│   │   ├── song.model.js
│   │   └── playlist.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── song.routes.js
│   │   ├── playlist.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   └── asyncHandler.js         # Async error wrapper
│   └── app.js
└── server.js
```

---

## ⚙️ Installation

### 1. Clone or navigate to the backend directory
```bash
cd "spotify project/backend"
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the `backend/` directory:
```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

### 4. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:5000`.

---

## 🔐 Authentication Flow

1. **Register** (`POST /register`) → Creates user, returns user object
2. **Login** (`POST /login`) → Returns a JWT token
3. **Use Token** → Add `Authorization: <token>` header to protected routes

> **Note:** The token is passed directly (not as `Bearer <token>`). All protected routes require this header.

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register a new user |
| POST | `/login` | ❌ | Login and get token |
| POST | `/favorites/:songId` | ✅ | Add song to favorites |
| GET | `/favorites` | ✅ | Get favorite songs |
| POST | `/recently-played/:songId` | ✅ | Manually add to recently played |
| GET | `/recently-played` | ✅ | Get recently played songs |

#### POST `/register`
```json
// Request Body
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response 201
{
  "message": "User Registered Successfully",
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

#### POST `/login`
```json
// Request Body
{
  "email": "john@example.com",
  "password": "password123"
}

// Response 200
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }
}
```

---

### Songs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/songs` | ✅ | Create a song |
| GET | `/songs` | ❌ | Get all songs (with pagination & filtering) |
| GET | `/songs/search?q=<query>` | ❌ | Search songs by title |
| GET | `/songs/:id` | ✅ | Get song by ID (auto-tracks recently played) |
| PUT | `/songs/:id` | ✅ | Update a song |
| DELETE | `/songs/:id` | ✅ | Delete a song |
| POST | `/songs/:id/upload-cover` | ✅ | Upload cover image |

#### GET `/songs` — Pagination & Filtering
```
GET /songs?page=1&limit=10
GET /songs?artist=Drake
GET /songs?album=Certified Lover Boy
GET /songs?artist=Drake&page=1&limit=5
```
```json
// Response
{
  "songs": [...],
  "totalSongs": 50,
  "currentPage": 1,
  "totalPages": 5
}
```

#### POST `/songs` — Create Song
```json
// Request Body
{
  "title": "God's Plan",
  "artist": "Drake",
  "album": "Scorpion",
  "duration": 198
}
```

#### POST `/songs/:id/upload-cover` — Cover Image Upload
- **Content-Type:** `multipart/form-data`
- **Field Name:** `cover`
- **Accepted:** `image/jpeg`, `image/png`, `image/webp`, etc.
- **Max Size:** 5MB

---

### Playlists

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/playlists` | ✅ | Create a playlist |
| GET | `/playlists` | ❌ | Get all playlists |
| GET | `/playlists/:id` | ❌ | Get playlist details (populated) |
| POST | `/playlists/:playlistId/add-song/:songId` | ✅ | Add song to playlist |
| DELETE | `/playlists/:playlistId/remove-song/:songId` | ✅ | Remove song from playlist |

#### GET `/playlists/:id` — Playlist Details
```json
// Response
{
  "_id": "...",
  "name": "My Favorites",
  "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
  "songs": [
    { "_id": "...", "title": "God's Plan", "artist": "Drake", "coverImage": "https://..." }
  ]
}
```

---

### User Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | ✅ | Get current user profile |
| PUT | `/profile` | ✅ | Update name/email |

#### PUT `/profile` — Update Profile
```json
// Request Body (all fields optional)
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}

// Response
{
  "message": "Profile updated successfully",
  "user": { "_id": "...", "name": "Jane Doe", "email": "jane@example.com", ... }
}
```

---

## ✅ Input Validation

All input is validated using `express-validator`. Invalid requests return:
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Must be a valid email address" },
    { "field": "password", "message": "Password must be at least 6 characters long" }
  ]
}
```

### Validation Rules
| Endpoint | Rules |
|----------|-------|
| `POST /register` | name (min 2), valid email, password (min 6) |
| `POST /login` | valid email, password required |
| `POST /songs` | title required, artist required, duration (number, optional) |
| `POST /playlists` | name required |

---

## 🔒 Security Features

- **Helmet** — Sets secure HTTP headers (XSS, clickjacking protection, etc.)
- **CORS** — Enables cross-origin requests
- **Morgan** — Logs all HTTP requests in development
- **bcrypt** — Passwords hashed with salt rounds of 10
- **JWT** — Signed with secret, expires in 7 days

---

## ⚠️ Error Handling

All errors are handled by the global error middleware and return a consistent format:

```json
{
  "success": false,
  "message": "Resource not found with id of 123abc",
  "stack": "..." // only shown in development mode
}
```

Handled error types:
- Mongoose CastError (invalid ObjectId) → `404`
- Duplicate key (code 11000) → `400`
- Mongoose ValidationError → `400`
- MulterError (file upload) → `400`
- All other errors → `500`

---

## 🧪 Postman Testing Guide

### Step 1: Import the Collection
Import `spotify-clone.postman_collection.json` into Postman.

### Step 2: Set Environment Variables
Create a Postman environment with:
- `BASE_URL` = `http://localhost:5000`
- `TOKEN` = (filled automatically after login)

### Step 3: Run in Order
1. **Register** a user
2. **Login** → token saved to `TOKEN` variable
3. **Create Song** → save `songId`
4. **Upload Cover** for the song
5. **Get Song by ID** → recently played auto-tracked
6. **Add to Favorites**
7. **Create Playlist** → save `playlistId`
8. **Add Song to Playlist**
9. **Get Playlist by ID** → verify populated data
10. **Get Profile** → verify recently played list

---

## 📦 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | `mysupersecretkey` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz` |
| `NODE_ENV` | Environment mode | `development` or `production` |
