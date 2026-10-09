/* TripNova: jQuery, AJAX/JSON, Bootstrap modals, and localStorage demo interactions */
$(function () {
  const fallbackTrips = [
    { id: "bali", name: "Bali, Indonesia", location: "Indonesia · Southeast Asia", category: "Beach", price: 18500, days: "5 days / 4 nights", rating: 4.9, reviews: 284, tag: "Island favourite", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=85", description: "Find your rhythm among emerald rice terraces, hidden waterfalls, temple sunsets, and beachside cafés.", highlights: ["Ubud rice terraces", "Uluwatu sunset", "Waterfall day trip"] },
    { id: "manali", name: "Manali, India", location: "Himachal Pradesh · India", category: "Nature", price: 7800, days: "4 days / 3 nights", rating: 4.8, reviews: 192, tag: "Mountain escape", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=85", description: "Breathe in crisp mountain air, wander pine-scented trails, and watch the Himalayas glow at golden hour.", highlights: ["Solang Valley", "Old Manali cafés", "Mountain viewpoints"] },
    { id: "jaipur", name: "Jaipur, India", location: "Rajasthan · India", category: "Culture", price: 6200, days: "3 days / 2 nights", rating: 4.7, reviews: 156, tag: "Colour & culture", image: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1000&q=85", description: "Step into a world of rose-coloured streets, intricate palaces, lively bazaars, and Rajasthani flavours.", highlights: ["Amber Fort", "Hawa Mahal", "Local bazaars"] },
    { id: "meghalaya", name: "Meghalaya, India", location: "Northeast India", category: "Adventure", price: 9400, days: "5 days / 4 nights", rating: 4.9, reviews: 118, tag: "Off the map", image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=85", description: "Follow misty roads into living-root bridges, lush valleys, caves, and waterfalls.", highlights: ["Living root bridges", "Dawki river", "Cherrapunji waterfalls"] },
    { id: "goa", name: "South Goa, India", location: "Goa · India", category: "Beach", price: 6900, days: "3 days / 2 nights", rating: 4.6, reviews: 231, tag: "Slow living", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=85", description: "Trade your schedule for sea breezes, quiet sandy coves, and long sunset walks.", highlights: ["Quiet beaches", "Old Goa heritage", "Sunset cafés"] },
    { id: "swiss", name: "Swiss Alps, Switzerland", location: "Switzerland · Europe", category: "Nature", price: 48500, days: "7 days / 6 nights", rating: 5.0, reviews: 307, tag: "Once in a lifetime", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1000&q=85", description: "Ride scenic trains past storybook villages, alpine lakes, and snow-dusted peaks.", highlights: ["Alpine train rides", "Lake viewpoints", "Mountain villages"] },
    { id: "varanasi", name: "Varanasi, India", location: "Uttar Pradesh · India", category: "Culture", price: 4800, days: "2 days / 1 night", rating: 4.7, reviews: 143, tag: "Soulful journey", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=85", description: "Experience riverside mornings, ancient lanes, craft traditions, and the timeless atmosphere of one of India's oldest living cities.", highlights: ["Ganga sunrise boat ride", "Old-city walk", "Evening aarti"] },
    { id: "rishikesh", name: "Rishikesh, India", location: "Uttarakhand · India", category: "Adventure", price: 5500, days: "3 days / 2 nights", rating: 4.8, reviews: 174, tag: "Find your edge", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85", description: "Pair riverside calm with a little adrenaline, forest walks, and seasonal rafting.", highlights: ["Ganga riverside", "Forest trails", "Seasonal rafting"] }
  ];
  let trips = [];
  let activeTrip = null;
  const tripModal = new bootstrap.Modal(document.getElementById("tripModal"));
  const bookingModal = new bootstrap.Modal(document.getElementById("bookingModal"));
  const toast = new bootstrap.Toast(document.getElementById("appToast"), { delay: 2800 });

  const readStorage = (key) => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; } };
  const saveStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = n => "₹" + Number(n).toLocaleString("en-IN");
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const savedIds = () => readStorage("tripnova_wishlist");
  function notify(message) { $("#toastMessage").text(message); toast.show(); }
  function getTrip(id) { return trips.find(t => t.id === id); }

  // AJAX loads the destination catalogue from JSON. A local fallback keeps the UI usable if opened without a local server.
  $.ajax({ url: "data/trips.json", dataType: "json", timeout: 5000 })
    .done(data => { trips = Array.isArray(data) ? data : fallbackTrips; renderTrips(); updateWishlistCount(); populateItineraryDestinations(); renderItinerary(); renderBookingManagement(); updateBookingCount(); })
    .fail(() => { trips = fallbackTrips; renderTrips(); updateWishlistCount(); populateItineraryDestinations(); renderItinerary(); renderBookingManagement(); updateBookingCount(); $("#resultsInfo").append(" · Demo data loaded locally"); });

  function renderTrips() {
    const term = ($("#searchInput").val() || "").trim().toLowerCase();
    const category = $("#categoryFilter").val();
    const budget = $("#budgetFilter").val();
    let filtered = trips.filter(t => {
      const matchesTerm = !term || [t.name, t.location, t.category, t.description].join(" ").toLowerCase().includes(term);
      const matchesCategory = category === "all" || t.category === category;
      const matchesBudget = budget === "all" || t.price <= Number(budget);
      return matchesTerm && matchesCategory && matchesBudget;
    });
    const sortMode = $("#sortFilter").val() || "recommended";
    filtered = filtered.slice();
    if (sortMode === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortMode === "price-desc") filtered.sort((a, b) => b.price - a.price);
    else if (sortMode === "rating-desc") filtered.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (sortMode === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
    $("#tripGrid").empty();
    $("#resultsInfo").text(`${filtered.length} ${filtered.length === 1 ? "destination" : "destinations"} to spark your next adventure`);
    $("#emptyState").toggleClass("d-none", filtered.length > 0);
    filtered.forEach((trip, i) => {
      const isSaved = savedIds().includes(trip.id);
      const card = `<div class="col-12 col-sm-6 col-xl-3">
        <article class="trip-card">
          <div class="trip-image-wrap">
            <img class="trip-image" src="${escapeHtml(trip.image)}" alt="${escapeHtml(trip.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80'">
            <span class="trip-tag">${escapeHtml(trip.tag || trip.category)}</span>
            <button class="save-trip ${isSaved ? "saved" : ""}" data-save="${escapeHtml(trip.id)}" aria-label="${isSaved ? "Remove from" : "Save to"} wishlist"><i class="bi ${isSaved ? "bi-heart-fill" : "bi-heart"}"></i></button>
          </div>
          <div class="trip-card-body">
            <div class="trip-location"><i class="bi bi-geo-alt"></i>${escapeHtml(trip.location)}</div>
            <div class="trip-title-row"><h3 class="trip-title">${escapeHtml(trip.name)}</h3><span class="trip-rating"><i class="bi bi-star-fill"></i> ${Number(trip.rating).toFixed(1)}</span></div>
            <p class="trip-desc">${escapeHtml(trip.description)}</p>
            <div class="trip-card-footer"><div><span class="price-label">Starting from</span><span class="trip-price">${money(trip.price)} <small>/ person</small></span></div><button class="trip-view" data-details="${escapeHtml(trip.id)}">View trip <i class="bi bi-arrow-up-right"></i></button></div>
          </div>
        </article>
      </div>`;
      $("#tripGrid").append(card);
    });
  }
  function updateBookingCount() {
    const count = readStorage("tripnova_bookings").filter(b => b.status !== "cancelled").length;
    $("#bookingCount").text(count > 99 ? "99+" : count);
  }
  function updateWishlistCount() {
    const count = savedIds().length;
    $("#wishlistCount").text(count > 99 ? "99+" : count);
    $("#drawerCount").text(`(${count})`);
  }
  function toggleSaved(id) {
    let saved = savedIds();
    if (saved.includes(id)) { saved = saved.filter(x => x !== id); notify("Removed from your saved trips."); }
    else { saved.push(id); notify("Trip saved to your shortlist."); }
    saveStorage("tripnova_wishlist", saved);
    renderTrips(); updateWishlistCount(); renderWishlist();
    if (activeTrip && activeTrip.id === id) updateModalSaveButton();
  }
  function updateModalSaveButton() {
    const isSaved = activeTrip && savedIds().includes(activeTrip.id);
    $("#modalSaveBtn").html(`<i class="bi ${isSaved ? "bi-heart-fill" : "bi-heart"} me-1"></i> ${isSaved ? "Saved trip" : "Save trip"}`);
  }
  function openTrip(id) {
    const t = getTrip(id); if (!t) return; activeTrip = t;
    $("#modalHero").css("background-image", `url("${t.image}")`);
    $("#modalCategory").text(t.category);
    $("#tripModalTitle").text(t.name);
    $("#modalLocation").html(`<i class="bi bi-geo-alt me-1"></i>${escapeHtml(t.location)}`);
    $("#modalDescription").text(t.description);
    $("#modalFacts").html(`<div class="modal-fact">Estimated budget<strong>${money(t.price)} / person</strong></div><div class="modal-fact">Suggested duration<strong>${escapeHtml(t.days)}</strong></div><div class="modal-fact">Traveller rating<strong><i class="bi bi-star-fill text-warning"></i> ${Number(t.rating).toFixed(1)} (${t.reviews} reviews)</strong></div><div class="modal-fact">Trip highlights<strong>${(t.highlights || []).map(escapeHtml).join(" · ")}</strong></div>`);
    updateModalSaveButton(); tripModal.show();
  }
  function renderWishlist() {
    const ids = savedIds(); const $list = $("#wishlistItems").empty();
    const items = ids.map(getTrip).filter(Boolean);
    if (!items.length) { $list.html('<div class="wishlist-empty"><i class="bi bi-heart"></i><strong>No saved trips yet</strong><p class="small mt-2">Tap the heart on a destination to keep it close.</p></div>'); return; }
    items.forEach(t => $list.append(`<div class="wishlist-item"><img src="${escapeHtml(t.image)}" alt=""><div class="wishlist-item-info"><strong>${escapeHtml(t.name)}</strong><small>${money(t.price)} / person · ${escapeHtml(t.days)}</small><div class="wishlist-item-actions"><button data-details="${escapeHtml(t.id)}">View details</button><button class="remove-saved" data-save="${escapeHtml(t.id)}">Remove</button></div></div></div>`));
  }
  function showWishlist() { renderWishlist(); $("body").addClass("wishlist-open"); $("#wishlistDrawer").attr("aria-hidden", "false"); }
  function hideWishlist() { $("body").removeClass("wishlist-open"); $("#wishlistDrawer").attr("aria-hidden", "true"); }

  $("#searchForm").on("submit", function (e) { e.preventDefault(); renderTrips(); $("#destinations")[0].scrollIntoView({ behavior: "smooth" }); });
  $("#searchInput").on("input", renderTrips);
  $("#categoryFilter,#budgetFilter,#sortFilter").on("change", renderTrips);
  $("#resetFilters,#emptyReset").on("click", function () { $("#searchInput").val(""); $("#categoryFilter").val("all"); $("#budgetFilter").val("all"); $("#sortFilter").val("recommended"); renderTrips(); });
  $(document).on("click", "[data-details]", function () { openTrip($(this).data("details")); });
  $(document).on("click", "[data-save]", function (e) { e.stopPropagation(); toggleSaved(String($(this).data("save"))); });
  $("[data-experience]").on("click", function () { $("#categoryFilter").val($(this).data("experience")); renderTrips(); $("#destinations")[0].scrollIntoView({ behavior: "smooth" }); });
  $("#navWishlist").on("click", showWishlist);
  $("#closeWishlist,#wishlistBackdrop").on("click", hideWishlist);
  $("#clearWishlist").on("click", function () { saveStorage("tripnova_wishlist", []); renderTrips(); renderWishlist(); updateWishlistCount(); if (activeTrip) updateModalSaveButton(); notify("Your saved-trip list has been cleared."); });
  $("#modalSaveBtn").on("click", function () { if (activeTrip) toggleSaved(activeTrip.id); });
  $("#bookTripBtn").on("click", function () {
    if (!activeTrip) return;
    $("#bookingTripId").val(activeTrip.id); $("#selectedTripName").text(`${activeTrip.name} · from ${money(activeTrip.price)} per person`);
    const today = new Date(); const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    $("#travelDate").attr("min", localDate).val("");
    tripModal.hide(); bookingModal.show();
  });
  $("#bookingForm").on("submit", function (e) {
    e.preventDefault();
    const booking = { id: "booking-" + Date.now(), tripId: $("#bookingTripId").val(), name: $("#travelerName").val().trim(), email: $("#travelerEmail").val().trim(), date: $("#travelDate").val(), travelers: Number($("#travelerCount").val()), createdAt: new Date().toISOString() };
    if (!booking.name || !booking.email || !booking.date) { notify("Please complete all required fields."); return; }
    const bookings = readStorage("tripnova_bookings"); bookings.push(booking); saveStorage("tripnova_bookings", bookings);
    this.reset(); bookingModal.hide(); updateBookingCount(); renderBookingManagement(); notify("Your trip plan has been saved in this browser!");
  });
  $("#newsletterForm").on("submit", function (e) {
    e.preventDefault();
    const email = $("#newsletterEmail").val().trim().toLowerCase();
    const subscribers = readStorage("tripnova_subscribers");
    if (subscribers.includes(email)) { $("#newsletterMessage").text("You're already on the list. Happy travels!"); return; }
    subscribers.push(email); saveStorage("tripnova_subscribers", subscribers);
    $("#newsletterMessage").text("You're on the list! Your next idea awaits."); this.reset();
  });
  $(document).on("keydown", function (e) { if (e.key === "Escape") hideWishlist(); });

  // Trip itinerary builder: stores activities locally and groups them by destination/day.
  function populateItineraryDestinations() {
    const $select = $("#itineraryDestination");
    const current = $select.val();
    $select.find("option:not(:first)").remove();
    trips.forEach(t => $select.append(`<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)}</option>`));
    if (current && getTrip(current)) $select.val(current);
  }
  function renderItinerary() {
    const entries = readStorage("tripnova_itinerary").slice().sort((a, b) =>
      a.destination.localeCompare(b.destination) || Number(a.day) - Number(b.day) ||
      ["Morning", "Afternoon", "Evening"].indexOf(a.time) - ["Morning", "Afternoon", "Evening"].indexOf(b.time)
    );
    $("#itineraryCount").text(`${entries.length} ${entries.length === 1 ? "activity" : "activities"}`);
    const $list = $("#itineraryList").empty();
    if (!entries.length) {
      $list.html('<div class="itinerary-empty"><i class="bi bi-map"></i><strong>Your itinerary is a blank canvas.</strong><p>Add your first activity above to start planning.</p></div>');
      return;
    }
    entries.forEach(item => {
      const trip = getTrip(item.tripId);
      $list.append(`<article class="itinerary-item">
        <div class="itinerary-day"><span>DAY</span><strong>${Number(item.day)}</strong></div>
        <div class="itinerary-item-main"><div class="itinerary-item-meta">${escapeHtml(item.destination)} <span>·</span> ${escapeHtml(item.time)}</div><h4>${escapeHtml(item.activity)}</h4>${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}</div>
        <button class="icon-action delete-itinerary" data-itinerary-remove="${escapeHtml(item.id)}" aria-label="Remove activity"><i class="bi bi-trash3"></i></button>
      </article>`);
    });
  }
  $("#itineraryForm").on("submit", function (e) {
    e.preventDefault();
    const tripId = $("#itineraryDestination").val();
    const trip = getTrip(tripId);
    const activity = $("#itineraryActivity").val().trim();
    if (!trip || !activity) { notify("Choose a destination and enter an activity."); return; }
    const entries = readStorage("tripnova_itinerary");
    entries.push({
      id: "activity-" + Date.now() + "-" + Math.random().toString(16).slice(2, 7),
      tripId, destination: trip.name, day: Number($("#itineraryDay").val()),
      time: $("#itineraryTime").val(), activity,
      notes: $("#itineraryNotes").val().trim()
    });
    saveStorage("tripnova_itinerary", entries);
    $("#itineraryActivity,#itineraryNotes").val("");
    renderItinerary();
    notify("Activity added to your itinerary.");
  });
  $(document).on("click", "[data-itinerary-remove]", function () {
    const id = String($(this).data("itinerary-remove"));
    saveStorage("tripnova_itinerary", readStorage("tripnova_itinerary").filter(x => x.id !== id));
    renderItinerary(); notify("Activity removed from itinerary.");
  });
  $("#clearItinerary").on("click", function () {
    saveStorage("tripnova_itinerary", []); renderItinerary(); notify("Your itinerary has been cleared.");
  });

  // Booking management panel: inspect saved demo requests and cancel them locally.
  function renderBookingManagement() {
    const bookings = readStorage("tripnova_bookings").slice().reverse();
    const $list = $("#bookingManagementList").empty();
    if (!bookings.length) {
      $list.html('<div class="booking-empty"><i class="bi bi-calendar2-check"></i><h3>No trip plans yet</h3><p>Open a destination and choose “Plan this trip” to create your first request.</p><a href="#destinations" class="btn btn-dark rounded-pill px-4">Explore destinations</a></div>');
      return;
    }
    bookings.forEach(b => {
      const trip = getTrip(b.tripId);
      const title = trip ? trip.name : "Trip destination";
      const status = b.status === "cancelled" ? "Cancelled" : "Plan saved";
      const statusClass = b.status === "cancelled" ? "status-cancelled" : "status-saved";
      const amount = trip ? money(trip.price * Number(b.travelers || 1)) : "—";
      $list.append(`<article class="booking-row ${b.status === "cancelled" ? "booking-cancelled" : ""}">
        <div class="booking-row-icon"><i class="bi bi-luggage"></i></div>
        <div class="booking-row-main"><div class="booking-row-top"><h3>${escapeHtml(title)}</h3><span class="booking-status ${statusClass}">${status}</span></div>
          <p>${escapeHtml(b.name)} · ${escapeHtml(b.email)}</p><div class="booking-meta"><span><i class="bi bi-calendar3 me-1"></i>${escapeHtml(b.date)}</span><span><i class="bi bi-people me-1"></i>${Number(b.travelers)} traveler${Number(b.travelers) === 1 ? "" : "s"}</span><span><i class="bi bi-wallet2 me-1"></i>Est. ${amount}</span></div>
        </div>
        ${b.status === "cancelled" ? '<span class="text-muted small">Archived</span>' : `<button class="btn btn-outline-danger btn-sm rounded-pill booking-cancel-btn" data-cancel-booking="${escapeHtml(b.id)}">Cancel plan</button>`}
      </article>`);
    });
  }
  $("#navBookings").on("click", function () {
    $("#bookingManagement")[0].scrollIntoView({ behavior: "smooth" });
    renderBookingManagement();
  });
  $("#refreshBookings").on("click", function () { renderBookingManagement(); updateBookingCount(); notify("Trip plan list refreshed."); });
  $(document).on("click", "[data-cancel-booking]", function () {
    const id = String($(this).data("cancel-booking"));
    const bookings = readStorage("tripnova_bookings");
    const target = bookings.find(b => b.id === id);
    if (!target || target.status === "cancelled") return;
    target.status = "cancelled";
    target.cancelledAt = new Date().toISOString();
    saveStorage("tripnova_bookings", bookings);
    renderBookingManagement(); updateBookingCount();
    notify("Trip plan cancelled in this browser.");
  });

  $("#year").text(new Date().getFullYear());
});