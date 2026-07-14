# Customer Loyalty Management System

A full-stack college backend project using Node.js, Express.js, MongoDB, Mongoose, and a polished HTML/CSS/JavaScript frontend.

## Features

- Register, edit, search, sort, and delete customers
- Award points after purchases
- Redeem customer reward points
- View transaction history
- Dashboard with total customers, points issued, points redeemed, revenue, recent transactions, and top 5 loyal customers
- MVC architecture with Express Router, Mongoose validation, async/await, environment variables, and centralized error handling

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file using `.env.example`:

```bash
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/customer_loyalty_system
NODE_ENV=development
JWT_SECRET=replace-this-with-a-long-random-secret
GOOGLE_CLIENT_ID=
```

3. Start MongoDB locally.

4. Run the project:

```bash
npm run dev
```

Open `http://localhost:5000`.

Optional: add sample customers and transactions:

```bash
npm run seed
```

If you do not have local MongoDB installed, create a free MongoDB Atlas cluster and paste its connection string into `MONGODB_URI`.

## Authentication

The app includes:

- Email/password signup and login
- JWT-protected dashboard APIs
- Google Sign-In support

To enable Google Sign-In, create an OAuth Client ID in Google Cloud Console and paste it into `GOOGLE_CLIENT_ID` in `.env`. Add `http://localhost:5000` as an authorized JavaScript origin while developing locally.

## API Endpoints

### Customer

- `POST /customers`
- `GET /customers`
- `GET /customers/:id`
- `PUT /customers/:id`
- `DELETE /customers/:id`

The same customer APIs are also available under `/api/customers`.

### Loyalty

- `POST /purchase`
- `POST /redeem`
- `GET /transactions`
- `GET /dashboard`
- `GET /reports/monthly`

The same loyalty APIs are also available under `/api`.

## Points Rule

Every `INR 100` spent earns `10 loyalty points`.

Example: `INR 500` purchase gives `50 points`.
