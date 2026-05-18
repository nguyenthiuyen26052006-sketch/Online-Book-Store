# Online Book Store Backend (Beginner-Friendly)

This backend uses:

- FastAPI (REST API)
- MySQL (database)
- SQLAlchemy (ORM)
- Pydantic (request/response validation)
- Docker Compose (run API + MySQL together)

---

## 1) Project Structure

```text
backend/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── auth.py
├── routers/
│   ├── users.py
│   ├── books.py
│   ├── cart.py
│   └── orders.py
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env
```

Why each file exists:

- `main.py`: FastAPI app entry point, includes routers, and auto-creates tables at startup.
- `database.py`: MySQL connection setup and `get_db()` helper.
- `models.py`: SQLAlchemy table models (`users`, `books`, `cart_items`, `orders`, `order_items`).
- `schemas.py`: Pydantic schemas for request body and response shape.
- `auth.py`: password hashing, JWT creation, and current-user authentication.
- `routers/*.py`: API endpoints grouped by feature.
- `Dockerfile`: how to build backend container.
- `docker-compose.yml`: runs API and MySQL together.
- `.env`: environment variables (database + JWT settings).

---

## 2) Docker Setup

`docker-compose.yml` includes:

- `db` service: MySQL 8.4
- `api` service: FastAPI app

It also:

- exposes MySQL on host port `3307`
- exposes API on `8000`
- stores MySQL data in Docker volume `mysql_data`

---

## 3) Database Connection

In `database.py`:

- read `.env` values
- build SQLAlchemy URL with `mysql+pymysql://...`
- create `engine`
- create `SessionLocal`
- provide `get_db()` for routes

---

## 4) Models

In `models.py`, tables are:

- `users`: user account data
- `books`: books for sale
- `cart_items`: items user added to cart
- `orders`: order header (total + timestamp)
- `order_items`: each book inside an order

The app auto-creates these tables on startup in `main.py`:

```python
Base.metadata.create_all(bind=engine)
```

---

## 5) Authentication

In `auth.py` + `routers/users.py`:

- Register: hash password with `passlib` bcrypt
- Login: verify password
- JWT: generate token using `python-jose`
- Protected routes: read JWT from `Authorization: Bearer <token>`

Auth endpoints:

- `POST /users/register`
- `POST /users/login`
- `GET /users/me`

---

## 6) CRUD APIs

### Categories

- `GET /categories`
- `GET /categories/{category_id}`
- `POST /categories` (admin only)
- `PUT /categories/{category_id}` (admin only)
- `DELETE /categories/{category_id}` (admin only)

### Books

- `GET /books` (also supports search `?search=...`)
- `GET /books/{book_id}`
- `POST /books` (auth required)
- `PUT /books/{book_id}` (auth required)
- `DELETE /books/{book_id}` (auth required)

### Cart

- `GET /cart` (auth required)
- `POST /cart` (auth required)
- `DELETE /cart/{cart_item_id}` (auth required)

### Orders

- `POST /orders` (auth required, creates order from cart)
- `GET /orders` (auth required)

---

## Demo Seed Data

If your database is empty, run:

```bash
python seed_demo.py
```

This creates:

- 1 admin account: `admin@bookstore.com / admin123`
- 1 user account: `user@example.com / user123`
- sample categories and books

---

## 7) Run the Server

From `backend/` folder:

```bash
docker compose up --build
```

Open:

- API root: <http://localhost:8000>
- Swagger docs: <http://localhost:8000/docs>

Stop:

```bash
docker compose down
```

If you also want to remove DB data volume:

```bash
docker compose down -v
```

---

## Sample API Requests

### Register

```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"password\":\"123456\"}"
```

### Login

```bash
curl -X POST "http://localhost:8000/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@example.com\",\"password\":\"123456\"}"
```

Copy `access_token` from response.

### Add Book (Protected)

```bash
curl -X POST "http://localhost:8000/books" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Clean Code\",\"author\":\"Robert C. Martin\",\"description\":\"Programming book\",\"price\":25.5,\"stock\":10}"
```

### Search Books

```bash
curl "http://localhost:8000/books?search=clean"
```

### Add to Cart

```bash
curl -X POST "http://localhost:8000/cart" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"book_id\":1,\"quantity\":2}"
```

### Create Order

```bash
curl -X POST "http://localhost:8000/orders" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### View Orders

```bash
curl "http://localhost:8000/orders" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
