// === Proteksi Halaman ===
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem("lostfound_user");

  // Jika user belum login dan buka halaman selain login/register
  if (
    !currentUser &&
    !window.location.pathname.includes("login.html") &&
    !window.location.pathname.includes("register.html")
  ) {
    window.location.href = "login.html";
  }
});

const API_BASE_URL = "http://127.0.0.1:5000/api/auth";
const AUTH_KEY = "lostfound_user"; // simpan token + nama

// Cek apakah user login
function isLoggedIn() {
  return localStorage.getItem(AUTH_KEY) !== null;
}

// Ambil user saat ini
function getCurrentUser() {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

// Login user ke backend Flask
async function loginUserBackend(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || "Login gagal.", "danger");
      return null;
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: data.token, email }));
    showAlert("✅ Login berhasil!", "success");
    return data;
  } catch (err) {
    console.error(err);
    showAlert("Terjadi kesalahan server.", "danger");
    return null;
  }
}

// Register user ke backend Flask
async function registerUserBackend(name, email, phone, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || "Registrasi gagal.", "danger");
      return null;
    }

    showAlert("✅ Registrasi berhasil! Silakan login.", "success");
    return data;
  } catch (err) {
    console.error(err);
    showAlert("Terjadi kesalahan server.", "danger");
    return null;
  }
}

// Logout
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "login.html";
}

// Initialize authentication check on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set max date for date inputs to today
  const today = new Date().toISOString().split('T')[0];
  ['lostDate', 'foundDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.max = today;
  });

  // Check authentication for protected pages
  if (!window.location.pathname.includes('login.html')) {
    requireAuth();
  }

  // Update navigation with user info and logout button
  updateNavigation();
});

// Update navigation with user info and logout button
function updateNavigation() {
  const user = getCurrentUser();
  if (user && !window.location.pathname.includes('login.html')) {
    // Add logout button to navigation
    const nav = document.querySelector('nav ul');
    if (nav && !document.getElementById('logoutBtn')) {
      const logoutBtn = document.createElement('li');
      logoutBtn.innerHTML = `<a href="#" id="logoutBtn" style="background: #dc3545; color: white;">Logout (${user.name})</a>`;
      nav.appendChild(logoutBtn);
      
      document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }
  }
}

// Bootstrap alert helper
function showAlert(message, type = 'success') {
  // Remove existing alert if any
  let oldAlert = document.getElementById('bootstrap-alert');
  if (oldAlert) oldAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.id = 'bootstrap-alert';
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertDiv.style.zIndex = 2000;
  alertDiv.style.minWidth = '300px';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(alertDiv);

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    if (alertDiv) alertDiv.remove();
  }, 3000);
}

// Image preview for file inputs
function previewImage(input, previewDiv) {
  previewDiv.innerHTML = '';
  if (input.files && input.files[0]) {
    const file = input.files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        previewDiv.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      previewDiv.textContent = 'Preview not available';
    }
  }
}

// Attach preview listeners
['lostImage', 'foundImage', 'claimProof'].forEach(id => {
  const input = document.getElementById(id);
  const previewDiv = document.getElementById(id + 'Preview');
  if (input && previewDiv) {
    input.addEventListener('change', () => previewImage(input, previewDiv));
  }
});

// Bootstrap-style form validation
function validateForm(form, fields) {
  let valid = true;
  fields.forEach(field => {
    const el = form.elements[field];
    if (el) {
      if (!el.value.trim()) {
        el.classList.add('is-invalid');
        el.classList.remove('is-valid');
        valid = false;
      } else {
        el.classList.remove('is-invalid');
        el.classList.add('is-valid');
      }
    }
  });
  // Date not in future
  const dateEl = form.querySelector('input[type="date"]');
  if (dateEl && dateEl.value) {
    const selected = new Date(dateEl.value);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (selected > today) {
      dateEl.classList.add('is-invalid');
      dateEl.classList.remove('is-valid');
      valid = false;
    } else {
      dateEl.classList.remove('is-invalid');
      dateEl.classList.add('is-valid');
    }
  }
  return valid;
}

// Enhanced form validation for lost items
const lostForm = document.getElementById('lostForm');

if (lostForm) {
 
lostForm.addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('lostName').value.trim();
  const description = document.getElementById('lostDesc').value.trim();
  const location = document.getElementById('lostLocation').value.trim();
  const user_id = 1; // buat tes aja

  try {
    const res = await fetch('http://127.0.0.1:5000/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        status: 'lost',
        location,
        user_id
      })
    });

    const data = await res.json();
    console.log(data);
    alert('Item berhasil dikirim!');
  } catch (err) {
    console.error('Error:', err);
    alert('Gagal kirim item!');
  }
});

}

    
    // Get form data
    const formData = new FormData(lostForm);
    const lostData = {
      itemName: formData.get('itemName'),
      category: formData.get('category'),
      description: formData.get('description'),
      location: formData.get('location'),
      dateLost: formData.get('dateLost'),
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      reward: formData.get('reward'),
      additionalInfo: formData.get('additionalInfo'),
      image: formData.get('image'),
      reportedBy: getCurrentUser()?.email || 'anonymous',
      reportedAt: new Date().toISOString()
    };

    // Validate required fields
    const requiredFields = ['lostName', 'lostDesc', 'lostCategory', 'lostLocation', 'lostDate', 'lostContactName', 'lostContactEmail', 'lostContactPhone'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    });

    // Email validation
    const email = document.getElementById('lostContactEmail');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('is-invalid');
      email.classList.remove('is-valid');
      isValid = false;
    }

    // Phone validation
    const phone = document.getElementById('lostContactPhone');
    if (phone.value && !/^\d{10}$/.test(phone.value.replace(/\D/g, ''))) {
      phone.classList.add('is-invalid');
      phone.classList.remove('is-valid');
      isValid = false;
    }

if (isValid) {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("itemName"),
        description: formData.get("description"),
        status: "lost",
        location: formData.get("location"),
        user_id: getCurrentUser()?.email || "anonymous"
      })
    });

    const data = await res.json();

    if (res.ok) {
      showAlert("✅ Lost item reported successfully!", "success");
      lostForm.reset();
      document.getElementById("lostImagePreview").innerHTML = "";
    } else {
      showAlert(data.message || "Failed to report lost item.", "danger");
    }
  } catch (err) {
    console.error(err);
    showAlert("Server error occurred.", "danger");
  }
}
      lostForm.reset();
      document.getElementById('lostImagePreview').innerHTML = '';
      lostForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
    } else {
      showAlert('Please fill all required fields correctly.', 'danger');
    }
  });
}

// Enhanced form validation for found items
const foundForm = document.getElementById('foundForm');
if (foundForm) {
  foundForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(foundForm);
    const foundData = {
      itemName: formData.get('itemName'),
      category: formData.get('category'),
      description: formData.get('description'),
      location: formData.get('location'),
      dateFound: formData.get('dateFound'),
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      condition: formData.get('condition'),
      currentLocation: formData.get('currentLocation'),
      additionalInfo: formData.get('additionalInfo'),
      image: formData.get('image'),
      reportedBy: getCurrentUser()?.email || 'anonymous',
      reportedAt: new Date().toISOString()
    };

    // Validate required fields
    const requiredFields = ['foundName', 'foundDesc', 'foundCategory', 'foundLocation', 'foundDate', 'foundContactName', 'foundContactEmail', 'foundContactPhone', 'foundCondition', 'foundCurrentLocation'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    });

    // Email validation
    const email = document.getElementById('foundContactEmail');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('is-invalid');
      email.classList.remove('is-valid');
      isValid = false;
    }

    // Phone validation
    const phone = document.getElementById('foundContactPhone');
    if (phone.value && !/^\d{10}$/.test(phone.value.replace(/\D/g, ''))) {
      phone.classList.add('is-invalid');
      phone.classList.remove('is-valid');
      isValid = false;
    }

    // Check terms checkbox
    const terms = document.getElementById('foundTerms');
    if (!terms.checked) {
      terms.classList.add('is-invalid');
      isValid = false;
    } else {
      terms.classList.remove('is-invalid');
    }

if (isValid) {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("itemName"),
        description: formData.get("description"),
        status: "found",
        location: formData.get("location"),
        user_id: getCurrentUser()?.id || 1

      })
    });

    const data = await res.json();

    if (res.ok) {
      showAlert("✅ Found item reported successfully!", "success");
      foundForm.reset();
      document.getElementById("foundImagePreview").innerHTML = "";
    } else {
      showAlert(data.message || "Failed to report found item.", "danger");
    }
  } catch (err) {
    console.error(err);
    showAlert("Server error occurred.", "danger");
  }
}

      
      showAlert('Found item reported successfully! Thank you for helping reunite lost items with their owners.', 'success');
      foundForm.reset();
      document.getElementById('foundImagePreview').innerHTML = '';
      foundForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
    } else {
      showAlert('Please fill all required fields correctly and agree to the terms.', 'danger');
    }
  });
}

// Enhanced form validation for claim items
const claimForm = document.getElementById('claimForm');
if (claimForm) {
  claimForm.addEventListener('submit', e => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(claimForm);
    const claimData = {
      itemId: formData.get('itemId'),
      description: formData.get('description'),
      proof: formData.get('proof'),
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      address: formData.get('address'),
      story: formData.get('story'),
      distinctive: formData.get('distinctive'),
      reward: formData.get('reward'),
      preferredContact: formData.get('preferredContact'),
      claimedBy: getCurrentUser()?.email || 'anonymous',
      claimedAt: new Date().toISOString()
    };

    // Validate required fields
    const requiredFields = ['claimItemId', 'claimDescription', 'claimProof', 'claimName', 'claimEmail', 'claimPhone', 'claimAddress', 'claimStory', 'claimDistinctive'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field.value.trim()) {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        isValid = false;
      } else {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
      }
    });

    // Email validation
    const email = document.getElementById('claimEmail');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('is-invalid');
      email.classList.remove('is-valid');
      isValid = false;
    }

    // Phone validation
    const phone = document.getElementById('claimPhone');
    if (phone.value && !/^\d{10}$/.test(phone.value.replace(/\D/g, ''))) {
      phone.classList.add('is-invalid');
      phone.classList.remove('is-valid');
      isValid = false;
    }

    // Check verification and terms checkboxes
    const verification = document.getElementById('claimVerification');
    const terms = document.getElementById('claimTerms');
    
    if (!verification.checked) {
      verification.classList.add('is-invalid');
      isValid = false;
    } else {
      verification.classList.remove('is-invalid');
    }

    if (!terms.checked) {
      terms.classList.add('is-invalid');
      isValid = false;
    } else {
      terms.classList.remove('is-invalid');
    }

    if (isValid) {
      // Store claim data
      const claims = JSON.parse(localStorage.getItem('lostfound_claims') || '[]');
      claims.push(claimData);
      localStorage.setItem('lostfound_claims', JSON.stringify(claims));
      
      showAlert('Claim submitted successfully! We\'ll review your claim and get back to you soon.', 'success');
      claimForm.reset();
      document.getElementById('claimProofPreview').innerHTML = '';
      claimForm.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
        el.classList.remove('is-valid', 'is-invalid');
      });
    } else {
      showAlert('Please fill all required fields correctly and agree to the terms.', 'danger');
    }
  });
}

// Home page functionality
function loadHomePageData() {
  // Load statistics
  const lostItems = JSON.parse(localStorage.getItem('lostfound_lost_items') || '[]');
  const foundItems = JSON.parse(localStorage.getItem('lostfound_found_items') || '[]');
  const claims = JSON.parse(localStorage.getItem('lostfound_claims') || '[]');
  
  // Update statistics
  document.getElementById('lostCount').textContent = lostItems.length;
  document.getElementById('foundCount').textContent = foundItems.length;
  document.getElementById('claimsCount').textContent = claims.length;
  document.getElementById('reunionsCount').textContent = Math.min(lostItems.length, foundItems.length); // Simple calculation
  
  // Load recent items
  loadRecentItems(lostItems, foundItems);
}

function loadRecentItems(lostItems, foundItems) {
  const itemGrid = document.getElementById('itemGrid');
  if (!itemGrid) return;
  
  // Combine and sort items by date
  const allItems = [
    ...lostItems.map(item => ({ ...item, type: 'lost' })),
    ...foundItems.map(item => ({ ...item, type: 'found' }))
  ].sort((a, b) => new Date(b.reportedAt || b.claimedAt) - new Date(a.reportedAt || a.claimedAt));
  
  // Clear existing content
  itemGrid.innerHTML = '';
  
  // Display recent items (limit to 6)
  const recentItems = allItems.slice(0, 6);
  
  if (recentItems.length === 0) {
    itemGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-light);">
        <h3>No items reported yet</h3>
        <p>Be the first to report a lost or found item!</p>
      </div>
    `;
    return;
  }
  
  recentItems.forEach(item => {
    const itemCard = createItemCard(item);
    itemGrid.appendChild(itemCard);
  });
}

function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  const date = item.reportedAt ? new Date(item.reportedAt).toLocaleDateString() : 'Recently';
  const location = item.location || item.locationFound || 'Unknown location';
  
  card.innerHTML = `
    <img src="${item.image ? URL.createObjectURL(item.image) : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDIwMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjhGQUZDIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTEwLjQ5IDcwIDEyMCA2MC40OTEgMTIwIDUwQzEyMCAzOS41MDkgMTEwLjQ5IDMwIDEwMCAzMEM4OS41MDkgMzAgODAgMzkuNTA5IDgwIDUwQzgwIDYwLjQ5MSA4OS41MDkgNzAgMTAwIDcwWiIgZmlsbD0iI0UyRThGMCIvPgo8cGF0aCBkPSJNMTIwIDEyMEg4MEM4MCA5Ny45MDkgOTcuOTA5IDgwIDEyMCA4MEgxMjBDMTQyLjA5MSA4MCAxNjAgOTcuOTA5IDE2MCAxMjBWMTIwWiIgZmlsbD0iI0UyRThGMCIvPgo8L3N2Zz4K'}" alt="${item.itemName}" class="card-image">
    <div class="card-content">
      <h3 class="item-title">${item.itemName}</h3>
      <p class="item-description">${item.description ? item.description.substring(0, 100) + '...' : 'No description available'}</p>
      <div class="item-meta">
        <span>${location} • ${date}</span>
        <span class="item-status ${item.type === 'lost' ? 'status-lost' : 'status-found'}">${item.type === 'lost' ? 'Lost' : 'Found'}</span>
      </div>
    </div>
  `;
  
  return card;
}

// Search bar (Home page)
const searchForm = document.getElementById('searchForm');
if (searchForm) {
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const keyword = document.getElementById('searchInput').value.trim().toLowerCase();
    const cards = document.querySelectorAll('.item-card');
    
    if (!keyword) {
      // If no keyword, show all cards
      cards.forEach(card => card.style.display = '');
      return;
    }
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(keyword) ? '' : 'none';
    });
  });
}

// Initialize demo data
function initializeDemoData() {
  // Create a demo user if none exists
  const users = JSON.parse(localStorage.getItem('lostfound_users') || '{}');
  if (Object.keys(users).length === 0) {
    users['demo@lostfound.com'] = {
      name: 'Demo User',
      email: 'demo@lostfound.com',
      phone: '9876543210',
      password: 'demo123',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('lostfound_users', JSON.stringify(users));
  }
  
  // Add some sample items if none exist
  const lostItems = JSON.parse(localStorage.getItem('lostfound_lost_items') || '[]');
  if (lostItems.length === 0) {
    const sampleLostItems = [
      {
        itemName: 'iPhone 13 Pro',
        category: 'electronics',
        description: 'Black iPhone 13 Pro with silver case. Has a small scratch on the back.',
        location: 'Library',
        dateLost: '2025-01-10',
        contactName: 'John Doe',
        contactEmail: 'john@example.com',
        contactPhone: '9876543210',
        reward: '5000',
        reportedBy: 'demo@lostfound.com',
        reportedAt: new Date().toISOString()
      },
      {
        itemName: 'Black Wallet',
        category: 'accessories',
        description: 'Leather wallet with driver\'s license and credit cards inside.',
        location: 'Cafeteria',
        dateLost: '2025-01-09',
        contactName: 'Jane Smith',
        contactEmail: 'jane@example.com',
        contactPhone: '9876543211',
        reward: '1000',
        reportedBy: 'demo@lostfound.com',
        reportedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('lostfound_lost_items', JSON.stringify(sampleLostItems));
  }
  
  const foundItems = JSON.parse(localStorage.getItem('lostfound_found_items') || '[]');
  if (foundItems.length === 0) {
    const sampleFoundItems = [
      {
        itemName: 'Set of Keys',
        category: 'keys',
        description: 'Three keys on a keychain with a small teddy bear keychain.',
        location: 'Parking Lot',
        dateFound: '2025-01-11',
        contactName: 'Mike Johnson',
        contactEmail: 'mike@example.com',
        contactPhone: '9876543212',
        condition: 'good',
        currentLocation: 'Security Office',
        reportedBy: 'demo@lostfound.com',
        reportedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('lostfound_found_items', JSON.stringify(sampleFoundItems));
  }
}

// Initialize demo data on first load
initializeDemoData();

// Initialize home page data when on index page
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
  loadHomePageData();
}

// Initialize home page data when on index page
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
  loadHomePageData();
}

// =============================
// LOGIN & REGISTER HANDLERS
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      const result = await loginUserBackend(email, password);
      if (result) {
        localStorage.setItem(
          AUTH_KEY,
          JSON.stringify({ token: result.token, email })
        );
        showAlert("Login berhasil! Mengalihkan...", "success");
        setTimeout(() => (window.location.href = "index.html"), 1500);
      }
    });
  }

  // REGISTER
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const phone = document.getElementById("regPhone").value.trim();
      const password = document.getElementById("regPassword").value.trim();

      const result = await registerUserBackend(name, email, phone, password);
      if (result) {
        showAlert("Registrasi berhasil! Silakan login.", "success");
        registerForm.reset();
      }
    });
  }
});

// === Logout Function ===
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("lostfound_user"); // hapus data login
      alert("Kamu sudah logout.");
      setTimeout(() => {
        window.location.href = "login.html"; // arahkan ke halaman login
      }, 300);
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('lostForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      title: document.getElementById('lostName').value,
      description: document.getElementById('lostDesc').value,
      location: document.getElementById('lostLocation').value,
      status: 'lost',
      user_id: 1
    };

    console.log('Data dikirim:', data); // tes di console browser

    try {
      const res = await fetch('http://127.0.0.1:5000/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      console.log('Respon dari server:', result);

      alert('Laporan berhasil dikirim!');
      form.reset();
    } catch (err) {
      console.error('Error:', err);
      alert('Gagal mengirim data');
    }
  });
});
