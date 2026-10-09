# TripNova — Travel Explorer

A responsive travel-discovery and trip-planning website built with HTML5, CSS3, JavaScript, Bootstrap 5, jQuery, AJAX, JSON, and browser localStorage.

## Features
- Responsive layout for mobile, tablet, and desktop
- Destination catalogue loaded from `data/trips.json` using jQuery AJAX, with fallback sample data
- Live destination search and travel-style / budget filters
- Destination sorting by recommended order, price (low/high), rating, and name
- Destination details modal with highlights, estimated price, duration, and ratings
- Wishlist / saved trips stored in `localStorage`
- Trip-planning form with required-field validation; demo trip plans stored locally
- Booking management panel to review and cancel saved demo trip plans
- Day-by-day itinerary builder with destination, day, activity, time, and notes
- Itinerary data saved locally; remove individual activities or clear the itinerary
- Newsletter subscription demo with duplicate-email handling
- Experience category shortcuts, toasts, and empty states

## Run the project
Recommended: open the `TripNova` folder in VS Code and run `index.html` with the **Live Server** extension.

Alternatively, run a local server from the folder containing `TripNova`:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000/TripNova/`.

Opening `index.html` directly with `file://` may prevent browsers from loading `data/trips.json`; the fallback catalogue will still display, but use a local server to demonstrate AJAX/JSON.

## Project structure
```text
TripNova/
├── index.html
├── README.md
├── css/style.css
├── js/app.js
└── data/trips.json
```

## Evaluation demo flow
1. Resize the page to demonstrate responsive navbar and destination cards.
2. Search for “Goa”; filter by Beach and set a budget.
3. Sort by price, then by rating.
4. Open a destination, show its details, and save it to the wishlist.
5. Create a trip plan with a future date and traveler count.
6. Open “Manage bookings” and cancel a demo plan; show its cancelled status.
7. Build an itinerary by adding activities for different days, then remove one.
8. Refresh the page to show wishlist, itinerary, and booking data persist in localStorage.
9. Open DevTools → Network and show the `data/trips.json` AJAX request.

## Notes
This is a front-end internship evaluation demo. Prices, ratings, reviews, and packages are sample content. Booking and newsletter forms store demo data in the current browser only; no backend, real reservation provider, payment, or email delivery is connected.
