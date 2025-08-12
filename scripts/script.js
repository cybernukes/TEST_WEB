import { db, collection, addDoc, getDocs } from "./firebase-config.js";

// Initialize containers object to hold DOM elements
const containers = {
  services: document.getElementById("services-container"),
  courses: document.getElementById("courses-container"),
  products: document.getElementById("products-container"),
  team: document.getElementById("team-container"),
};

// Firebase collections
const servicesCollection = collection(db, "services");
const coursesCollection = collection(db, "courses");
const productsCollection = collection(db, "products");
const teamCollection = collection(db, "team");

// Load all data for public site
async function loadPublicData() {
  try {
    // Load services
    const servicesSnapshot = await getDocs(servicesCollection);
    const services = [];
    servicesSnapshot.forEach((doc) => {
      services.push({ id: doc.id, ...doc.data() });
    });
    renderServices(services);

    // Load courses
    const coursesSnapshot = await getDocs(coursesCollection);
    const courses = [];
    coursesSnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    renderCourses(courses);

    // Load products
    const productsSnapshot = await getDocs(productsCollection);
    const products = [];
    productsSnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    renderProducts(products);

    // Load team
    const teamSnapshot = await getDocs(teamCollection);
    const team = [];
    teamSnapshot.forEach((doc) => {
      team.push({ id: doc.id, ...doc.data() });
    });
    renderTeam(team);
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function renderCourses(courses) {
  if (!courses.length || !containers.courses) return;

  containers.courses.innerHTML = courses
    .map(
      (course) => `
    <a href="${course.link || "#"}" class="course-link">
      <div class="card">
        <img src="${course.image}" alt="${course.title}">
        <div class="card-body">
          <h5>${course.title}</h5>
          <p>${course.description?.substring(0, 100) || ""}...</p>
          <div id="button" style="display: flex; justify-content: center;">
            <button class="see-more-btn" style="color: white; text-decoration: none;">See More</button>
          </div>
        </div>
      </div>
    </a>
  `
    )
    .join("");
}

function renderProducts(products) {
  if (!products.length || !containers.products) return;

  containers.products.innerHTML = products
    .map(
      (product) => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${
        product.title
      }" onerror="this.src='https://static.vecteezy.com/system/resources/previews/018/733/763/non_2x/gallery-simple-flat-icon-illustration-vector.jpg'">
      </div>
      <h3>${product.title}</h3>
      <p>${product.description || ""}</p>
      <ul class="product-features">
        ${
          product.features?.map((feature) => `<li>${feature}</li>`).join("") ||
          ""
        }
      </ul>
      <!-- <button class="product-cta">Learn More</button> -->
    </div>
  `
    )
    .join("");
}

function renderTeam(team) {
  if (!team.length || !containers.team) return;

  containers.team.innerHTML = team
    .map(
      (member) => `
    <div class="team-card">
      <div class="team-image">
        <img src="${member.image}" alt="${
        member.name
      }" onerror="this.src='default-profile.jpg'">
      </div>
      <h3>${member.name}</h3>
      <p class="position">${member.position}</p>
      <p class="bio">${member.bio?.substring(0, 100) || ""}...</p>
      <div class="social-links">
        ${
          member.linkedin
            ? `<a href="${member.linkedin}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-linkedin"></i></a>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");
}

function renderServices(services) {
  if (!services.length || !containers.services) return;

  containers.services.innerHTML = services
    .map(
      (service) => `
    <div class="service-card">
      <img src="${service.image}" alt="${service.title}">
      <div class="card-content">
        <div class="card-title">${service.title}</div>
        <ul>
          ${
            service.features
              ?.map((feature) => `<li>${feature}</li>`)
              .join("") || ""
          }
        </ul>
        <div style="display: flex; justify-content: center; width: 100%;">
          <a href="${
            service.link || "#"
          }" class="see-more-btn" style="color: white; text-decoration: none; text-align:center;  width: 100%;">See More</a>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  loadPublicData();
});

// Contact Form Submission
document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form elements
    const form = e.target;
    const submitBtn = form.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;

    // Get form data
    const formData = new FormData(form);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      timestamp: new Date().toISOString(),
      status: "unread", // Track message status
    };

    // Simple form validation
    if (!data.name || !data.email || !data.message) {
      showAlert("Please fill in all required fields.", "error");
      return;
    }

    // Email validation
    if (!validateEmail(data.email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }

    // Change button state
    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;
    form.style.opacity = "0.7";
    form.style.pointerEvents = "none";

    try {
      // Add document to Firestore
      const docRef = await addDoc(collection(db, "contacts"), data);

      // Success feedback
      showAlert(
        "Thank you for your message! We'll get back to you soon.",
        "success"
      );
      form.reset();

      console.log("Message saved with ID: ", docRef.id);
    } catch (error) {
      console.error("Error saving message: ", error);
      showAlert(
        "There was an error sending your message. Please try again later.",
        "error"
      );
    } finally {
      // Reset button and form state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      form.style.opacity = "1";
      form.style.pointerEvents = "auto";
    }
  });

// Email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Alert message helper
function showAlert(message, type) {
  // Remove existing alerts
  const existingAlert = document.querySelector(".form-alert");
  if (existingAlert) existingAlert.remove();

  // Create alert element
  const alert = document.createElement("div");
  alert.className = `form-alert alert-${type}`;
  alert.textContent = message;

  // Insert alert
  const form = document.getElementById("contactForm");
  form.parentNode.insertBefore(alert, form);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Add smooth focus animations
document.querySelectorAll(".form-input, .form-textarea").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.style.transform = "scale(1.02)";
  });

  input.addEventListener("blur", function () {
    this.parentElement.style.transform = "scale(1)";
  });
});

//footer
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Scroll to top button functionality
const scrollTopBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.classList.add("visible");
  } else {
    scrollTopBtn.classList.remove("visible");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Add hover animations to nav items
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("mouseenter", function () {
    this.style.paddingLeft = "10px";
  });

  link.addEventListener("mouseleave", function () {
    this.style.paddingLeft = "0";
  });
});

document.querySelectorAll(".product-cta").forEach((button) => {
  button.addEventListener("click", function (e) {
    e.preventDefault();

    // Add click animation
    this.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.style.transform = "";
    }, 150);

    // Here you would typically navigate to the product detail page
    console.log(
      "Navigate to product details for:",
      this.closest(".product-card").querySelector(".product-title").textContent
    );
  });
});

// Add parallax effect to floating elements
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll(".floating-circle");

  parallaxElements.forEach((element, index) => {
    const speed = (index + 1) * 0.5;
    element.style.transform = `translateY(${scrolled * speed}px) rotate(${
      scrolled * 0.1
    }deg)`;
  });
});

// Add intersection observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe product cards
document.querySelectorAll(".product-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-5px)";
    this.querySelector(".product-image img").style.transform = "scale(1.05)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "";
    this.querySelector(".product-image img").style.transform = "";
  });
});
