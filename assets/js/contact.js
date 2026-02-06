// ===== Contact Form: Validation + EmailJS Sending (2 emails) =====
(function () {
  // Only run on pages that have the booking form
  const form = document.getElementById("bookingForm");
  if (!form) return;

  // ---- EmailJS init ----
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  const TEMPLATE_ADMIN_ID = "YOUR_TEMPLATE_ADMIN_ID";
  const TEMPLATE_USER_ID = "YOUR_TEMPLATE_USER_ID";

  // Who receives the admin lead email
  const ADMIN_EMAIL = "admin@example.com";

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  // ---- DOM ----
  const msgEl = document.getElementById("formMsg");
  const submitBtn = document.getElementById("submitBtn");

  const fields = {
    full_name: document.getElementById("full_name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    pickup_location: document.getElementById("pickup_location"),
    service: document.getElementById("service"),
    ride_date: document.getElementById("ride_date"),
    ride_time: document.getElementById("ride_time")
  };

  // ---- Helpers ----
  function setMsg(text, type) {
    // type: "error" | "success" | "info"
    msgEl.textContent = text;
    msgEl.style.color = type === "success" ? "green" : type === "info" ? "#1d8fd1" : "crimson";
  }

  function trimValue(el) {
    return (el.value || "").trim();
  }

  function isValidEmail(email) {
    // Simple but solid email pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function isValidPhone(phone) {
    // Allows +, spaces, hyphens, parentheses. Requires at least 10 digits.
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function isFutureOrToday(dateStr) {
    // dateStr: "YYYY-MM-DD"
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const picked = new Date(dateStr + "T00:00:00");
    return picked >= today;
  }

  function validate() {
    // Clear message
    setMsg("", "info");

    // Full name
    const fullName = trimValue(fields.full_name);
    if (fullName.length < 3) {
      setMsg("Please enter your full name (at least 3 characters).", "error");
      fields.full_name.focus();
      return false;
    }

    // Email
    const email = trimValue(fields.email);
    if (!isValidEmail(email)) {
      setMsg("Please enter a valid email address (example: name@email.com).", "error");
      fields.email.focus();
      return false;
    }

    // Phone
    const phone = trimValue(fields.phone);
    if (!isValidPhone(phone)) {
      setMsg("Please enter a valid phone number (at least 10 digits).", "error");
      fields.phone.focus();
      return false;
    }

    // Pickup location
    const pickup = trimValue(fields.pickup_location);
    if (pickup.length < 5) {
      setMsg("Please enter a pickup location (at least 5 characters).", "error");
      fields.pickup_location.focus();
      return false;
    }

    // Service
    const service = fields.service.value;
    if (!service) {
      setMsg("Please select a service (Ambulatory / Wheelchair / Stretcher).", "error");
      fields.service.focus();
      return false;
    }

    // Ride date
    const rideDate = fields.ride_date.value;
    if (!rideDate) {
      setMsg("Please select your ride date.", "error");
      fields.ride_date.focus();
      return false;
    }
    if (!isFutureOrToday(rideDate)) {
      setMsg("Ride date cannot be in the past. Please choose today or a future date.", "error");
      fields.ride_date.focus();
      return false;
    }

    // Ride time
    const rideTime = fields.ride_time.value;
    if (!rideTime) {
      setMsg("Please select your ride time.", "error");
      fields.ride_time.focus();
      return false;
    }

    // Optional: prevent "time in past" if date is today
    const now = new Date();
    const pickedDateTime = new Date(`${rideDate}T${rideTime}:00`);
    if (pickedDateTime < now && new Date(rideDate + "T00:00:00").toDateString() === now.toDateString()) {
      setMsg("Ride time cannot be earlier than the current time (for today).", "error");
      fields.ride_time.focus();
      return false;
    }

    return true;
  }

  function getFormData() {
    return {
      full_name: trimValue(fields.full_name),
      email: trimValue(fields.email),
      phone: trimValue(fields.phone),
      pickup_location: trimValue(fields.pickup_location),
      service: fields.service.value,
      ride_date: fields.ride_date.value,
      ride_time: fields.ride_time.value
    };
  }

  async function sendEmails(data) {
    // Email 1: Admin lead email (all details)
    const adminParams = {
      to_email: ADMIN_EMAIL,
      subject: "New NEMT Booking Request",
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      pickup_location: data.pickup_location,
      service: data.service,
      ride_date: data.ride_date,
      ride_time: data.ride_time
    };

    // Email 2: User confirmation email
    const userParams = {
      to_email: data.email,
      subject: "We received your booking request (NEMT)",
      full_name: data.full_name,
      service: data.service,
      ride_date: data.ride_date,
      ride_time: data.ride_time,
      pickup_location: data.pickup_location
    };

    // Send both
    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_ADMIN_ID, adminParams);
    await emailjs.send(EMAILJS_SERVICE_ID, TEMPLATE_USER_ID, userParams);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const data = getFormData();

    try {
      submitBtn.disabled = true;
      setMsg("Submitting your request…", "info");

      await sendEmails(data);

      setMsg("Success! We received your booking request. Please check your email for confirmation.", "success");
      form.reset();
    } catch (err) {
      console.error(err);
      setMsg("Sorry — we could not submit your request right now. Please try again, or call us.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

})();
