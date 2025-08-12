import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
} from "/scripts/firebase-config.js";

// Firebase collections
const servicesCollection = collection(db, "services");
const coursesCollection = collection(db, "courses");
const productsCollection = collection(db, "products");
const teamCollection = collection(db, "team");
const contactsCollection = collection(db, "contacts");

async function loadAllData() {
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

    const contactsSnapshot = await getDocs(contactsCollection);
    const contacts = [];
    contactsSnapshot.forEach((doc) => {
      contacts.push({ id: doc.id, ...doc.data() });
    });
    renderContacts(contacts);

    // Update stats
    updateStats(
      services.length,
      courses.length,
      products.length,
      team.length,
      contacts.length
    );
  } catch (error) {
    showNotification("Error loading data: " + error.message, false);
  }
}

// Render services to the table
function renderServices(services) {
  const tbody = document.querySelector("#services-section tbody");
  tbody.innerHTML = "";

  services.forEach((service) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${service.title}</td>
        <td>${service.image}</td>
        <td>${service.features.length} features</td>
        <td>${service.link}</td>
        <td>
          <button class="btn btn-sm btn-edit action-btn" data-id="${service.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-delete action-btn" data-id="${service.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
    tbody.appendChild(row);
  });
}

// Render courses to the table
function renderCourses(courses) {
  const tbody = document.querySelector("#courses-section tbody");
  tbody.innerHTML = "";

  courses.forEach((course) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${course.title}</td>
        <td>${course.image}</td>
        <td>${course.description.substring(0, 50)}...</td>
        <td>${course.link}</td>
        <td>
          <button class="btn btn-sm btn-edit action-btn" data-id="${course.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-delete action-btn" data-id="${
            course.id
          }">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
    tbody.appendChild(row);
  });
}

// Render products to the table
function renderProducts(products) {
  const tbody = document.querySelector("#products-section tbody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><img src="${
          product.image
        }" width="40" height="40" class="rounded" /></td>
        <td>${product.title}</td>
        <td>${product.description.substring(0, 30)}...</td>
        <td>${product.features.length} features</td>
        <td>
          <button class="btn btn-sm btn-edit action-btn" data-id="${
            product.id
          }">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-delete action-btn" data-id="${
            product.id
          }">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
    tbody.appendChild(row);
  });
}

// Render team members to the table
function renderTeam(team) {
  const tbody = document.querySelector("#team-section tbody");
  tbody.innerHTML = "";

  team.forEach((member) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${
          member.image
        }" width="40" height="40" class="rounded-circle" />
      </td>
      <td>${member.name}</td>
      <td>${member.position}</td>
      <td>${member.bio.substring(0, 30)}...</td>
      <td>
        <button class="btn btn-sm btn-edit action-btn edit-member" data-id="${
          member.id
        }">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-delete action-btn delete-member" data-id="${
          member.id
        }">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update stats cards
function updateStats(servicesCount, coursesCount, productsCount, teamCount) {
  // Add IDs to your stats cards in HTML
  document.getElementById("services-count").textContent = servicesCount;
  document.getElementById("courses-count").textContent = coursesCount;
  document.getElementById("products-count").textContent = productsCount;
  document.getElementById("team-count").textContent = teamCount;
}

// Service Management
async function addService(serviceData) {
  try {
    const newDocRef = doc(servicesCollection);
    await setDoc(newDocRef, serviceData);
    showNotification("Service added successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error adding service: " + error.message, false);
    return false;
  }
}

function initializeFormHandlers() {
  // Service form submission
  const serviceFormBtn = document.querySelector(
    "#addServiceModal .btn-primary"
  );
  serviceFormBtn.onclick = null; // Remove any existing handler
  serviceFormBtn.addEventListener("click", handleServiceFormSubmit);

  // Course form submission
  const courseFormBtn = document.querySelector("#addCourseModal .btn-primary");
  courseFormBtn.onclick = null;
  courseFormBtn.addEventListener("click", handleCourseFormSubmit);

  // Product form submission
  const productFormBtn = document.querySelector(
    "#addProductModal .btn-primary"
  );
  productFormBtn.onclick = null;
  productFormBtn.addEventListener("click", handleProductFormSubmit);

  // Team form submission
  const teamFormBtn = document.querySelector("#addTeamModal .btn-primary");
  teamFormBtn.onclick = null;
  teamFormBtn.addEventListener("click", handleTeamFormSubmit);
}

async function handleServiceFormSubmit() {
  const modal = this.closest(".modal-content");
  const form = modal.querySelector("form");
  const serviceData = {
    title: form.querySelector("#service-title").value,
    image: form.querySelector("#service-image").value,
    features: form
      .querySelector("#service-features")
      .value.split(",")
      .map((f) => f.trim()),
    link: form.querySelector("#service-link").value,
    updatedAt: new Date().toISOString(),
  };

  const serviceId = modal.parentElement.dataset.editId;

  try {
    if (serviceId) {
      // Editing existing service
      await editService(serviceId, serviceData);
    } else {
      // Adding new service
      serviceData.createdAt = new Date().toISOString();
      await addService(serviceData);
    }

    // Close modal and reset
    bootstrap.Modal.getInstance(modal.parentElement).hide();
    form.reset();
    delete modal.parentElement.dataset.editId;
    modal.querySelector(".modal-title").textContent = "Add New Service";
  } catch (error) {
    showNotification("Error processing service: " + error.message, false);
  }
}

async function handleCourseFormSubmit() {
  const modal = this.closest(".modal-content");
  const form = modal.querySelector("form");
  const courseData = {
    title: form.querySelector("#course-title").value,
    image: form.querySelector("#course-image").value,
    description: form.querySelector("#course-description").value,
    link: form.querySelector("#course-link").value,
    updatedAt: new Date().toISOString(),
  };

  const courseId = modal.parentElement.dataset.editId;

  try {
    if (courseId) {
      await editCourse(courseId, courseData);
    } else {
      courseData.createdAt = new Date().toISOString();
      await addCourse(courseData);
    }

    bootstrap.Modal.getInstance(modal.parentElement).hide();
    form.reset();
    delete modal.parentElement.dataset.editId;
    modal.querySelector(".modal-title").textContent = "Add New Course";
  } catch (error) {
    showNotification("Error processing course: " + error.message, false);
  }
}

async function handleProductFormSubmit() {
  const modal = this.closest(".modal-content");
  const form = modal.querySelector("form");
  const productData = {
    image: form.querySelector("#product-image").value, // Changed from icon to image
    title: form.querySelector("#product-title").value,
    description: form.querySelector("#product-description").value,
    features: form
      .querySelector("#product-features")
      .value.split(",")
      .map((f) => f.trim()),
    updatedAt: new Date().toISOString(),
  };

  const productId = modal.parentElement.dataset.editId;

  try {
    if (productId) {
      await editProduct(productId, productData);
    } else {
      productData.createdAt = new Date().toISOString();
      await addProduct(productData);
    }

    bootstrap.Modal.getInstance(modal.parentElement).hide();
    form.reset();
    delete modal.parentElement.dataset.editId;
    modal.querySelector(".modal-title").textContent = "Add New Product";
  } catch (error) {
    showNotification("Error processing product: " + error.message, false);
  }
}

// Team form handler
async function handleTeamFormSubmit() {
  const modal = document.getElementById("addTeamModal");
  const form = document.getElementById("teamForm");
  const memberData = {
    name: form.querySelector("#member-name").value,
    position: form.querySelector("#member-position").value,
    bio: form.querySelector("#member-bio").value,
    image: form.querySelector("#member-image").value,
    linkedin: form.querySelector("#member-linkedin").value,
    updatedAt: new Date().toISOString(),
  };

  const memberId = form.querySelector("#member-id").value;

  try {
    if (memberId) {
      await editTeamMember(memberId, memberData);
    } else {
      memberData.createdAt = new Date().toISOString();
      await addTeamMember(memberData);
    }

    bootstrap.Modal.getInstance(modal).hide();
    form.reset();
    form.querySelector("#member-id").value = "";
    modal.querySelector(".modal-title").textContent = "Add New Team Member";
  } catch (error) {
    showNotification("Error processing team member: " + error.message, false);
  }
}

async function deleteService(serviceId) {
  try {
    await deleteDoc(doc(db, "services", serviceId));
    showNotification("Service deleted successfully!");
    loadAllData();
  } catch (error) {
    showNotification("Error deleting service: " + error.message, false);
  }
}

// Course Management
async function addCourse(courseData) {
  try {
    const newDocRef = doc(coursesCollection);
    await setDoc(newDocRef, courseData);
    showNotification("Course added successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error adding course: " + error.message, false);
    return false;
  }
}

async function deleteCourse(courseId) {
  try {
    await deleteDoc(doc(db, "courses", courseId));
    showNotification("Course deleted successfully!");
    loadAllData();
  } catch (error) {
    showNotification("Error deleting course: " + error.message, false);
  }
}

// Product Management
async function addProduct(productData) {
  try {
    const newDocRef = doc(productsCollection);
    await setDoc(newDocRef, productData);
    showNotification("Product added successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error adding product: " + error.message, false);
    return false;
  }
}

async function deleteProduct(productId) {
  try {
    await deleteDoc(doc(db, "products", productId));
    showNotification("Product deleted successfully!");
    loadAllData();
  } catch (error) {
    showNotification("Error deleting product: " + error.message, false);
  }
}

// Team Management
async function addTeamMember(memberData) {
  try {
    const newDocRef = doc(teamCollection);
    await setDoc(newDocRef, memberData);
    showNotification("Team member added successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error adding team member: " + error.message, false);
    return false;
  }
}

async function editTeamMember(memberId, memberData) {
  try {
    await updateDoc(doc(db, "team", memberId), memberData);
    showNotification("Team member updated successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error updating team member: " + error.message, false);
    return false;
  }
}

async function deleteTeamMember(memberId) {
  try {
    await deleteDoc(doc(db, "team", memberId));
    showNotification("Team member deleted successfully!");
    loadAllData();
  } catch (error) {
    showNotification("Error deleting team member: " + error.message, false);
  }
}

async function loadMemberForEdit(memberId) {
  try {
    const docSnap = await getDoc(doc(db, "team", memberId));
    if (docSnap.exists()) {
      const member = docSnap.data();
      document.getElementById("member-id").value = memberId;
      document.getElementById("member-name").value = member.name;
      document.getElementById("member-position").value = member.position;
      document.getElementById("member-bio").value = member.bio;
      document.getElementById("member-image").value = member.image;
      document.getElementById("member-linkedin").value = member.linkedin || "";

      document.getElementById("teamModalTitle").textContent =
        "Edit Team Member";
      const modal = new bootstrap.Modal(
        document.getElementById("addTeamModal")
      );
      modal.show();
    }
  } catch (error) {
    showNotification("Error loading team member: " + error.message, false);
  }
}

// Service Management - Edit
async function editService(serviceId, serviceData) {
  try {
    await updateDoc(doc(db, "services", serviceId), serviceData);
    showNotification("Service updated successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error updating service: " + error.message, false);
    return false;
  }
}

async function loadServiceForEdit(serviceId) {
  try {
    const docSnap = await getDoc(doc(db, "services", serviceId));
    if (docSnap.exists()) {
      const service = docSnap.data();
      const modal = document.getElementById("addServiceModal");

      // Fill the form
      modal.querySelector("#service-title").value = service.title;
      modal.querySelector("#service-image").value = service.image;
      modal.querySelector("#service-features").value =
        service.features.join(", ");
      modal.querySelector("#service-link").value = service.link;

      // Store the ID in the modal itself
      modal.setAttribute("data-edit-id", serviceId);
      modal.querySelector(".modal-title").textContent = "Edit Service";

      // Show the modal
      new bootstrap.Modal(modal).show();
    }
  } catch (error) {
    showNotification("Error loading service: " + error.message, false);
  }
}

// Course Management - Edit
async function editCourse(courseId, courseData) {
  try {
    await updateDoc(doc(db, "courses", courseId), courseData);
    showNotification("Course updated successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error updating course: " + error.message, false);
    return false;
  }
}

async function loadCourseForEdit(courseId) {
  try {
    const docSnap = await getDoc(doc(db, "courses", courseId));
    if (docSnap.exists()) {
      const course = docSnap.data();
      const modal = document.getElementById("addCourseModal");

      modal.querySelector("#course-title").value = course.title;
      modal.querySelector("#course-image").value = course.image;
      modal.querySelector("#course-description").value = course.description;
      modal.querySelector("#course-link").value = course.link;

      modal.setAttribute("data-edit-id", courseId);
      modal.querySelector(".modal-title").textContent = "Edit Course";

      new bootstrap.Modal(modal).show();
    }
  } catch (error) {
    showNotification("Error loading course: " + error.message, false);
  }
}

// Product Management - Edit
async function editProduct(productId, productData) {
  try {
    await updateDoc(doc(db, "products", productId), productData);
    showNotification("Product updated successfully!");
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error updating product: " + error.message, false);
    return false;
  }
}

async function loadProductForEdit(productId) {
  try {
    const docSnap = await getDoc(doc(db, "products", productId));
    if (docSnap.exists()) {
      const product = docSnap.data();
      document.getElementById("product-image").value = product.image; // Changed from icon to image
      document.getElementById("product-title").value = product.title;
      document.getElementById("product-description").value =
        product.description;
      document.getElementById("product-features").value =
        product.features.join(", ");

      const modal = document.getElementById("addProductModal");
      modal.dataset.editId = productId;
      modal.querySelector(".modal-title").textContent = "Edit Product";

      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  } catch (error) {
    showNotification("Error loading product: " + error.message, false);
  }
}

// Initialize the admin panel
document.addEventListener("DOMContentLoaded", () => {
  loadAllData();

  // Service form submission
  document
    .querySelector("#addServiceModal .btn-primary")
    .addEventListener("click", async function () {
      const modal = this.closest(".modal-content");
      const serviceData = {
        title: modal.querySelector("#service-title").value,
        image: modal.querySelector("#service-image").value,
        features: modal
          .querySelector("#service-features")
          .value.split(",")
          .map((f) => f.trim()),
        link: modal.querySelector("#service-link").value,
        createdAt: new Date().toISOString(),
      };

      if (await addService(serviceData)) {
        bootstrap.Modal.getInstance(modal.parentElement).hide();
        modal.querySelector("form").reset();
      }
    });

  // Course form submission
  document
    .querySelector("#addCourseModal .btn-primary")
    .addEventListener("click", async function () {
      const modal = document.getElementById("addCourseModal");
      const form = modal.querySelector("form");

      const courseData = {
        title: form.querySelector("#course-title").value,
        image: form.querySelector("#course-image").value,
        description: form.querySelector("#course-description").value,
        link: form.querySelector("#course-link").value,
        updatedAt: new Date().toISOString(),
      };

      const courseId = modal.getAttribute("data-edit-id");

      try {
        if (courseId) {
          await updateDoc(doc(db, "courses", courseId), courseData);
          showNotification("Course updated successfully!");
        } else {
          courseData.createdAt = new Date().toISOString();
          await setDoc(doc(coursesCollection), courseData);
          showNotification("Course added successfully!");
        }

        bootstrap.Modal.getInstance(modal).hide();
        form.reset();
        modal.removeAttribute("data-edit-id");
        modal.querySelector(".modal-title").textContent = "Add New Course";
        loadAllData();
      } catch (error) {
        showNotification("Error processing course: " + error.message, false);
      }
    });

  // Product form submission
  document
    .querySelector("#addProductModal .btn-primary")
    .addEventListener("click", async function () {
      const modalElement = document.getElementById("addProductModal");
      const modal =
        bootstrap.Modal.getInstance(modalElement) ||
        new bootstrap.Modal(modalElement);

      try {
        const form = document.getElementById("productForm");
        const productData = {
          image: form.querySelector("#product-image").value,
          title: form.querySelector("#product-title").value,
          description: form.querySelector("#product-description").value,
          features: form
            .querySelector("#product-features")
            .value.split(",")
            .map((f) => f.trim()),
          updatedAt: new Date().toISOString(),
        };

        if (modalElement.dataset.editId) {
          await updateDoc(
            doc(db, "products", modalElement.dataset.editId),
            productData
          );
          showNotification("Product updated successfully!");
        } else {
          productData.createdAt = new Date().toISOString();
          await addDoc(productsCollection, productData);
          showNotification("Product added successfully!");
        }

        modal.hide();
        form.reset();
        delete modalElement.dataset.editId;
        loadAllData();
      } catch (error) {
        showNotification("Error: " + error.message, false);
      }
    });

  // Team form submission
  document
    .querySelector("#addTeamModal .btn-primary")
    .addEventListener("click", async function () {
      const modal = this.closest(".modal-content");
      const memberData = {
        name: modal.querySelector("#member-name").value,
        position: modal.querySelector("#member-position").value,
        bio: modal.querySelector("#member-bio").value,
        image: modal.querySelector("#member-image").value,
        createdAt: new Date().toISOString(),
      };

      if (await addTeamMember(memberData)) {
        bootstrap.Modal.getInstance(modal.parentElement).hide();
        modal.querySelector("form").reset();
      }
    });

  // Delete handlers
  document.addEventListener("click", function (e) {
    // Service delete
    if (e.target.closest("#services-section .btn-delete")) {
      const serviceId = e.target.closest(".btn-delete").dataset.id;
      if (confirm("Are you sure you want to delete this service?")) {
        deleteService(serviceId);
      }
    }

    // Course delete
    if (e.target.closest("#courses-section .btn-delete")) {
      const courseId = e.target.closest(".btn-delete").dataset.id;
      if (confirm("Are you sure you want to delete this course?")) {
        deleteCourse(courseId);
      }
    }

    // Product delete
    if (e.target.closest("#products-section .btn-delete")) {
      const productId = e.target.closest(".btn-delete").dataset.id;
      if (confirm("Are you sure you want to delete this product?")) {
        deleteProduct(productId);
      }
    }

    // Team delete
    if (e.target.closest("#team-section .btn-delete")) {
      const memberId = e.target.closest(".btn-delete").dataset.id;
      if (confirm("Are you sure you want to delete this team member?")) {
        deleteTeamMember(memberId);
      }
    }
  });

  document
    .getElementById("saveMemberBtn")
    .addEventListener("click", async function () {
      const modal = document.getElementById("addTeamModal");
      const memberId = document.getElementById("member-id").value;
      const memberData = {
        name: document.getElementById("member-name").value,
        position: document.getElementById("member-position").value,
        bio: document.getElementById("member-bio").value,
        image: document.getElementById("member-image").value,
        linkedin: document.getElementById("member-linkedin").value,
        updatedAt: new Date().toISOString(),
      };

      if (memberId) {
        // Editing existing member
        if (await editTeamMember(memberId, memberData)) {
          bootstrap.Modal.getInstance(modal).hide();
          document.getElementById("teamForm").reset();
        }
      } else {
        // Adding new member
        memberData.createdAt = new Date().toISOString();
        if (await addTeamMember(memberData)) {
          bootstrap.Modal.getInstance(modal).hide();
          document.getElementById("teamForm").reset();
        }
      }
    });

  // Edit member handler
  document.addEventListener("click", function (e) {
    if (e.target.closest(".edit-member")) {
      const memberId = e.target.closest(".edit-member").dataset.id;
      loadMemberForEdit(memberId);
    }
  });

  // Reset modal when closed
  document
    .getElementById("addTeamModal")
    .addEventListener("hidden.bs.modal", function () {
      document.getElementById("teamForm").reset();
      document.getElementById("member-id").value = "";
      document.getElementById("teamModalTitle").textContent =
        "Add New Team Member";
    });
});

// Notification system
function showNotification(message, isSuccess = true) {
  const notification = document.querySelector(".notification");
  const messageEl = notification.querySelector(".message");
  const icon = notification.querySelector("i");

  messageEl.textContent = message;

  if (isSuccess) {
    notification.classList.add("success");
    notification.classList.remove("error");
    icon.className = "fas fa-check-circle me-2 text-success";
  } else {
    notification.classList.add("error");
    notification.classList.remove("success");
    icon.className = "fas fa-exclamation-circle me-2 text-danger";
  }

  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Add contacts rendering function
function renderContacts(contacts) {
  const tbody = document.getElementById("contacts-table-body");
  tbody.innerHTML = "";

  // Sort by date (newest first)
  contacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  contacts.forEach((contact) => {
    const row = document.createElement("tr");
    row.className = contact.status === "unread" ? "unread-message" : "";
    row.innerHTML = `
      <td>${contact.name}</td>
      <td><a href="mailto:${contact.email}">${contact.email}</a></td>
      <td>${contact.phone || "N/A"}</td>
      <td>${contact.message.substring(0, 50)}${
      contact.message.length > 50 ? "..." : ""
    }</td>
      <td>${new Date(contact.timestamp).toLocaleString()}</td>
      <td>
        <span class="badge ${
          contact.status === "unread" ? "bg-primary" : "bg-secondary"
        }">
          ${contact.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-info action-btn view-message" data-id="${
          contact.id
        }">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-delete action-btn delete-message" data-id="${
          contact.id
        }">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Add message viewing modal (add to your HTML before the closing </body> tag)
const messageModalHTML = `
<div class="modal fade" id="viewMessageModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Message Details</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <p><strong>Name:</strong> <span id="message-name"></span></p>
          </div>
          <div class="col-md-6">
            <p><strong>Email:</strong> <span id="message-email"></span></p>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-6">
            <p><strong>Phone:</strong> <span id="message-phone"></span></p>
          </div>
          <div class="col-md-6">
            <p><strong>Date:</strong> <span id="message-date"></span></p>
          </div>
        </div>
        <div class="mb-3">
          <p><strong>Message:</strong></p>
          <div class="p-3 bg-light rounded" id="message-content"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="mark-as-read">Mark as Read</button>
      </div>
    </div>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", messageModalHTML);

// Add contact message management functions
async function viewMessage(messageId) {
  try {
    const messageDoc = await getDoc(doc(db, "contacts", messageId));
    if (messageDoc.exists()) {
      const message = messageDoc.data();

      // Populate modal
      document.getElementById("message-name").textContent = message.name;
      document.getElementById("message-email").textContent = message.email;
      document.getElementById("message-phone").textContent =
        message.phone || "N/A";
      document.getElementById("message-date").textContent = new Date(
        message.timestamp
      ).toLocaleString();
      document.getElementById("message-content").textContent = message.message;

      // Store current message ID
      const modal = new bootstrap.Modal(
        document.getElementById("viewMessageModal")
      );
      modal._element.dataset.currentMessage = messageId;

      // Update mark as read button
      const markAsReadBtn = document.getElementById("mark-as-read");
      markAsReadBtn.textContent =
        message.status === "read" ? "Mark as Unread" : "Mark as Read";
      markAsReadBtn.className =
        message.status === "read" ? "btn btn-warning" : "btn btn-primary";

      modal.show();

      // Mark as read when opening if unread
      if (message.status === "unread") {
        await updateMessageStatus(messageId, "read");
      }
    }
  } catch (error) {
    showNotification("Error loading message: " + error.message, false);
  }
}

async function updateMessageStatus(messageId, status) {
  try {
    await updateDoc(doc(db, "contacts", messageId), {
      status: status,
    });
    loadAllData();
    return true;
  } catch (error) {
    showNotification("Error updating message status: " + error.message, false);
    return false;
  }
}

async function deleteMessage(messageId) {
  try {
    await deleteDoc(doc(db, "contacts", messageId));
    showNotification("Message deleted successfully!");
    loadAllData();
  } catch (error) {
    showNotification("Error deleting message: " + error.message, false);
  }
}

async function markAllAsRead() {
  try {
    const querySnapshot = await getDocs(
      query(contactsCollection, where("status", "==", "unread"))
    );
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { status: "read" });
    });

    await batch.commit();
    showNotification(`Marked ${querySnapshot.size} messages as read`);
    loadAllData();
  } catch (error) {
    showNotification("Error marking messages as read: " + error.message, false);
  }
}

async function deleteAllRead() {
  if (!confirm("Are you sure you want to delete all read messages?")) return;

  try {
    const querySnapshot = await getDocs(
      query(contactsCollection, where("status", "==", "read"))
    );
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    showNotification(`Deleted ${querySnapshot.size} read messages`);
    loadAllData();
  } catch (error) {
    showNotification("Error deleting read messages: " + error.message, false);
  }
}

// Add to your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // ... existing code ...

  // View message handler
  document.addEventListener("click", function (e) {
    if (e.target.closest(".view-message")) {
      const messageId = e.target.closest(".view-message").dataset.id;
      viewMessage(messageId);
    }
  });

  // Delete message handler
  document.addEventListener("click", function (e) {
    if (e.target.closest(".delete-message")) {
      const messageId = e.target.closest(".delete-message").dataset.id;
      if (confirm("Are you sure you want to delete this message?")) {
        deleteMessage(messageId);
      }
    }
  });

  // Mark as read/unread handler
  document
    .getElementById("mark-as-read")
    .addEventListener("click", async function () {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("viewMessageModal")
      );
      const messageId = modal._element.dataset.currentMessage;

      const currentStatus = this.textContent.includes("Unread")
        ? "unread"
        : "read";
      if (await updateMessageStatus(messageId, currentStatus)) {
        modal.hide();
      }
    });

  // Mark all as read
  document
    .getElementById("mark-all-read")
    .addEventListener("click", markAllAsRead);

  // Delete all read
  document
    .getElementById("delete-all-read")
    .addEventListener("click", deleteAllRead);
});

// Update the service form submission
document
  .querySelector("#addServiceModal .btn-primary")
  .addEventListener("click", async function () {
    const modal = this.closest(".modal");
    const form = modal.querySelector("form");
    const serviceId = modal.dataset.editId;

    const serviceData = {
      title: form.querySelector("#service-title").value,
      image: form.querySelector("#service-image").value,
      features: form
        .querySelector("#service-features")
        .value.split(",")
        .map((f) => f.trim()),
      link: form.querySelector("#service-link").value,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (serviceId) {
        await editService(serviceId, serviceData);
      } else {
        serviceData.createdAt = new Date().toISOString();
        await addService(serviceData);
      }
      bootstrap.Modal.getInstance(modal).hide();
      form.reset();
    } catch (error) {
      showNotification("Error: " + error.message, false);
    }
  });

// Update the course form submission
document
  .querySelector("#addCourseModal .btn-primary")
  .addEventListener("click", async function () {
    const modal = this.closest(".modal-content");
    const courseData = {
      title: modal.querySelector("#course-title").value,
      image: modal.querySelector("#course-image").value,
      description: modal.querySelector("#course-description").value,
      link: modal.querySelector("#course-link").value,
      updatedAt: new Date().toISOString(),
    };

    const courseId = modal.parentElement.dataset.editId;

    if (courseId) {
      if (await editCourse(courseId, courseData)) {
        bootstrap.Modal.getInstance(modal.parentElement).hide();
        modal.querySelector("form").reset();
        delete modal.parentElement.dataset.editId;
        modal.querySelector(".modal-title").textContent = "Add New Course";
      }
    } else {
      courseData.createdAt = new Date().toISOString();
      if (await addCourse(courseData)) {
        bootstrap.Modal.getInstance(modal.parentElement).hide();
        modal.querySelector("form").reset();
      }
    }
  });

// Update the product form submission
document
  .querySelector("#addProductModal .btn-primary")
  .addEventListener("click", async function () {
    const modal = this.closest(".modal-content");
    const productData = {
      icon: modal.querySelector("#product-image").value,
      title: modal.querySelector("#product-title").value,
      description: modal.querySelector("#product-description").value,
      features: modal
        .querySelector("#product-features")
        .value.split(",")
        .map((f) => f.trim()),
      updatedAt: new Date().toISOString(),
    };

    const productId = modal.parentElement.dataset.editId;

    if (productId) {
      if (await editProduct(productId, productData)) {
        bootstrap.Modal.getInstance(modal.parentElement).hide();
        modal.querySelector("form").reset();
        delete modal.parentElement.dataset.editId;
        modal.querySelector(".modal-title").textContent = "Add New Product";
      }
    } else {
      productData.createdAt = new Date().toISOString();
      if (await addProduct(productData)) {
        bootstrap.Modal.getInstance(modal.parentElement).hide();
        modal.querySelector("form").reset();
      }
    }
  });

// Reset modals when closed
document
  .getElementById("addServiceModal")
  .addEventListener("hidden.bs.modal", function () {
    this.removeAttribute("data-edit-id");
    this.querySelector(".modal-title").textContent = "Add New Service";
    this.querySelector("form").reset();
  });

document
  .getElementById("addCourseModal")
  .addEventListener("hidden.bs.modal", function () {
    this.querySelector("form").reset();
    delete this.dataset.editId;
    this.querySelector(".modal-title").textContent = "Add New Course";
  });

document
  .getElementById("addProductModal")
  .addEventListener("hidden.bs.modal", function () {
    this.querySelector("form").reset();
    delete this.dataset.editId;
    this.querySelector(".modal-title").textContent = "Add New Product";
  });

// Add to your existing click event listener
document.addEventListener("click", function (e) {
  // Service edit
  if (e.target.closest("#services-section .btn-edit")) {
    const serviceId = e.target.closest(".btn-edit").dataset.id;
    loadServiceForEdit(serviceId);
  }

  // Course edit
  if (e.target.closest("#courses-section .btn-edit")) {
    const courseId = e.target.closest(".btn-edit").dataset.id;
    loadCourseForEdit(courseId);
  }

  // Product edit
  if (e.target.closest("#products-section .btn-edit")) {
    const productId = e.target.closest(".btn-edit").dataset.id;
    loadProductForEdit(productId);
  }
});
