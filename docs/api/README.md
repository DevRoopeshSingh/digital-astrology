# API Sketch

## Astro-Core Service

- `GET /horoscope/daily` — returns daily horoscope payload.
- `POST /kundli/generate` — body with birth details, returns chart summary.
- `POST /compatibility/match` — accepts partner metadata, returns score.

## Commerce Service

- `GET /products` — list marketplace products.
- `POST /cart` — create or update cart.
- `POST /checkout` — initiates payment session via Razorpay/PhonePe.

## Consultations Service

- `GET /astrologers/:id/slots` — fetch available slots.
- `POST /consultations` — book a new consultation.
