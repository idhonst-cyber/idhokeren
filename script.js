/* ═══════════════════════════════════════════════════════════
   Ridwan Rattan — Animations & Interactions
   ═══════════════════════════════════════════════════════════ */

/* ── 1. Page transition overlay ────────────────────────────── */
(function initPageTransition() {
  // Inject overlay element once
  const overlay = document.createElement("div");
  overlay.id = "page-transition";
  document.body.prepend(overlay);

  // Intercept nav link clicks for smooth exit
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href");
    // Only handle same-origin, non-hash, non-external links
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      link.target === "_blank"
    ) return;

    e.preventDefault();
    overlay.classList.add("leaving");

    setTimeout(() => {
      window.location.href = href;
    }, 480);
  });

  // Fade in on load
  window.addEventListener("pageshow", () => {
    overlay.classList.remove("leaving");
  });
})();

/* ── 2. Toast notification (replaces alert) ────────────────── */
function showToast(message, icon = "✓", duration = 3200) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ── 3. Sticky navbar shadow on scroll ─────────────────────── */
(function initStickyNav() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const handler = () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  };
  window.addEventListener("scroll", handler, { passive: true });
  handler(); // run once on load
})();

/* ── 4. Scroll-reveal with Intersection Observer ───────────── */
(function initScrollReveal() {
  const selectors = [
    ".hero-copy",
    ".hero-image",
    ".trust-row div",
    ".intro-section > div",
    ".feature-card",
    ".product-card",
    ".quote-intro",
    ".quote-card",
    ".faq-list details",
    ".story-banner-inner > *",
    ".page-heading > *",
  ];

  selectors.forEach((sel, si) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      // Pick animation direction based on selector group
      if (si === 1) {
        el.classList.add("reveal-right"); // hero image slides from right
      } else if (si === 0) {
        el.classList.add("reveal-left");  // hero copy slides from left
      } else {
        el.classList.add("reveal");
      }

      // Stagger delay for grids
      const delayClass = ["delay-1","delay-2","delay-3","delay-4","delay-5"][i] || "delay-5";
      el.classList.add(delayClass);
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((el) => {
    io.observe(el);
  });
})();

/* ── 5. Parallax hero image (subtle) ───────────────────────── */
(function initParallax() {
  const heroImg = document.querySelector(".hero-image");
  if (!heroImg) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.18;
    heroImg.style.transform = `translateY(${y}px)`;
  }, { passive: true });
})();

/* ── 6. Nav-quote badge pulse when cart changes ─────────────── */
function pulseCartBadge() {
  document.querySelectorAll("[data-cart-count]").forEach(el => {
    el.classList.remove("pulse");
    void el.offsetWidth; // reflow to restart
    el.classList.add("pulse");
  });
}

const products = {
  chair: { name: "Rattan Lounge Chair", price: 185 },
  basket: { name: "Market Basket", price: 38 },
  lamp: { name: "Woven Pendant Lamp", price: 72 },
  table: { name: "Round Side Table", price: 125 }
};

// Demo shipping rates per order. Replace with actual carrier quotes.
const shippingRates = {
  asia: { price: 95, days: "10–18 business days" },
  europe: { price: 180, days: "18–30 business days" },
  "north-america": { price: 210, days: "20–35 business days" },
  other: { price: 240, days: "Please ask us for an estimate" }
};

// Demo exchange rate only. Replace with a current rate or a currency API.
const demoUsdToIdrRate = 16000;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("ridwanRattanCart")) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem("ridwanRattanCart", JSON.stringify(cart));
}

function formatMoney(amount) {
  const currencySelect = document.getElementById("currency");
  const currency = currencySelect ? currencySelect.value : "USD";
  const converted = currency === "IDR" ? amount * demoUsdToIdrRate : amount;

  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2
  }).format(converted);
}

function updateCartCount() {
  const cart = getCart();
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  document.querySelectorAll("[data-cart-count]").forEach(element => {
    element.textContent = `(${count})`;
  });
}

function renderQuote() {
  const cartContainer = document.getElementById("cart-items");
  if (!cartContainer) return;

  const cart = getCart();
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const destinationSelect = document.getElementById("destination");
  const destination = destinationSelect ? destinationSelect.value : "asia";

  if (!entries.length) {
    cartContainer.innerHTML =
      '<p class="empty-cart">Your quote is empty. Add a product to get started.</p>';

    document.getElementById("subtotal").textContent = formatMoney(0);
    document.getElementById("shipping").textContent = formatMoney(0);
    document.getElementById("total").textContent = formatMoney(0);
    document.getElementById("delivery-note").textContent =
      "Add products to see an indicative delivery timeframe.";

    return;
  }

  let subtotal = 0;

  cartContainer.innerHTML = entries.map(([id, quantity]) => {
    const product = products[id];
    if (!product) return "";

    subtotal += product.price * quantity;

    return `
      <div class="cart-item">
        <span class="cart-item-name">${product.name}</span>
        <span class="cart-item-price">${formatMoney(product.price * quantity)}</span>
        <span class="quantity">
          <button
            type="button"
            aria-label="Remove one ${product.name}"
            data-action="minus"
            data-id="${id}"
          >−</button>
          <strong>${quantity}</strong>
          <button
            type="button"
            aria-label="Add one ${product.name}"
            data-action="plus"
            data-id="${id}"
          >+</button>
        </span>
      </div>
    `;
  }).join("");

  const shipping = shippingRates[destination].price;

  document.getElementById("subtotal").textContent = formatMoney(subtotal);
  document.getElementById("shipping").textContent = formatMoney(shipping);
  document.getElementById("total").textContent = formatMoney(subtotal + shipping);
  document.getElementById("delivery-note").textContent =
    `Indicative delivery timeframe: ${shippingRates[destination].days}. Production time, customs clearance, and carrier schedules may affect delivery.`;
}

document.querySelectorAll(".add-to-quote").forEach(button => {
  button.addEventListener("click", () => {
    const cart = getCart();
    const id = button.dataset.product;

    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
    updateCartCount();
    pulseCartBadge();

    // Visual feedback
    button.textContent = "Added! ✓";
    button.classList.add("added");
    button.disabled = true;

    showToast(`<strong>${products[id]?.name}</strong> added to your quote`, "🛒");

    window.setTimeout(() => {
      button.textContent = "Add to quote";
      button.classList.remove("added");
      button.disabled = false;
    }, 1200);
  });
});

const cartItems = document.getElementById("cart-items");

if (cartItems) {
  cartItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;

    const cart = getCart();
    const id = button.dataset.id;

    cart[id] = (cart[id] || 0) + (button.dataset.action === "plus" ? 1 : -1);

    if (cart[id] <= 0) {
      delete cart[id];
    }

    saveCart(cart);
    updateCartCount();
    renderQuote();
  });
}

document.getElementById("destination")?.addEventListener("change", renderQuote);
document.getElementById("currency")?.addEventListener("change", renderQuote);

document.getElementById("copy-quote")?.addEventListener("click", async () => {
  const cart = getCart();
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);

  if (!entries.length) {
    alert("Please add at least one product to your quote.");
    return;
  }

  const destinationSelect = document.getElementById("destination");
  const destination = destinationSelect.value;
  const shipping = shippingRates[destination].price;
  const subtotal = entries.reduce((sum, [id, quantity]) => {
    return sum + products[id].price * quantity;
  }, 0);

  const productLines = entries.map(([id, quantity]) => {
    return `- ${products[id].name} x ${quantity}`;
  }).join("\n");

  const message = [
    "Ridwan Rattan — Order Estimate",
    productLines,
    `Product subtotal: ${formatMoney(subtotal)}`,
    `Estimated shipping: ${formatMoney(shipping)}`,
    `Estimated total: ${formatMoney(subtotal + shipping)}`,
    `Destination: ${destinationSelect.options[destinationSelect.selectedIndex].text}`,
    `Indicative delivery: ${shippingRates[destination].days}`,
    "Please confirm the final price, shipping, and delivery schedule."
  ].join("\n");

  try {
    await navigator.clipboard.writeText(message);
    showToast("Quote copied! Paste it into an email or WhatsApp.", "📋", 4000);
  } catch {
    window.prompt("Copy your quote details:", message);
  }
});

updateCartCount();
renderQuote();

/* ── 7. Smooth image fade-in on load ────────────────────────── */
document.querySelectorAll("img").forEach(img => {
  if (img.complete) {
    img.classList.add("loaded");
  } else {
    img.addEventListener("load", () => img.classList.add("loaded"));
    img.addEventListener("error", () => img.classList.add("loaded")); // avoid invisible broken img
  }
});

/* ── 8. Animate grand total when value changes ──────────────── */
(function initTotalAnimation() {
  const totalEl = document.getElementById("total");
  if (!totalEl) return;

  const observer = new MutationObserver(() => {
    totalEl.classList.remove("updated");
    void totalEl.offsetWidth;
    totalEl.classList.add("updated");
  });

  observer.observe(totalEl, { childList: true, subtree: true });
})();