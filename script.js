const app = document.getElementById("app");
const registerPage = document.getElementById("registerPage");
const experiencePage = document.getElementById("experiencePage");
const settingsPage = document.getElementById("settingsPage");
const list = document.getElementById("list");
const loading = document.getElementById("loading");
const userName = document.getElementById("userName");
const userJob = document.getElementById("userJob");
const userAvatar = document.getElementById("userAvatar");
const countBadge = document.getElementById("countBadge");
const toastEl = document.getElementById("toast");

/* ─── PAGE SWITCHING ─── */
function switchPage(page) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

  if (page === 'experience') {
    experiencePage.style.display = 'grid';
    settingsPage.classList.remove('active');
    document.getElementById('nav-experience').classList.add('active');
    loadData();
  } else if (page === 'settings') {
    experiencePage.style.display = 'none';
    settingsPage.classList.add('active');
    document.getElementById('nav-settings').classList.add('active');
    loadSettingsData();
  }
}

function switchSettingsTab(tab, btn) {
  document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');

  // Persist active tab
  localStorage.setItem('settingsTab', tab);
}

/* ─── INIT ─── */
function initApp() {
  // If hash is #view, show public profile instead
  if (window.location.hash === '#view') {
    checkHash();
    return;
  }

  let user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    showApp(user);
    // Restore settings tab if on settings page
    const savedTab = localStorage.getItem('settingsTab');
    if (savedTab) {
      const tabBtn = document.querySelector(`.settings-nav-item[onclick*="'${savedTab}'"]`);
      if (tabBtn) switchSettingsTab(savedTab, tabBtn);
    }
  } else {
    registerPage.style.display = "flex";
  }
}

/* ─── EMAIL VALIDATION ─── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function register() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let job = document.getElementById("job").value.trim();
  let password = document.getElementById("regPassword").value;

  // Clear previous errors
  clearFieldErrors();

  if (!name || !email || !job || !password) {
    showToast("Please fill in all fields", "error");
    highlightEmptyFields(['name', 'email', 'job', 'regPassword']);
    return;
  }

  if (!isValidEmail(email)) {
    showFieldError('email', 'Please enter a valid email address');
    showToast("Please enter a valid email address", "error");
    return;
  }

  if (password.length < 8) {
    showFieldError('regPassword', 'Password must be at least 8 characters');
    showToast("Password must be at least 8 characters", "error");
    return;
  }

  let user = { 
    name, 
    email, 
    job, 
    password, // Note: In a real app, never store plaintext passwords
    verified: false, 
    bio: '', 
    location: '', 
    website: '', 
    phone: '', 
    memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    twoFA: false
  };
  localStorage.setItem("user", JSON.stringify(user));
  showApp(user);
  showToast("Account created successfully!", "success");
}

function updateAvatarDisplay(user) {
  // Sidebar avatar
  if (user.avatar) {
    userAvatar.innerHTML = `<img src="${user.avatar}" alt="avatar">`;
  } else {
    userAvatar.innerText = user.name.charAt(0).toUpperCase();
  }

  // Settings avatar
  let avatarText = document.getElementById('settingsAvatarText');
  if (avatarText) {
    if (user.avatar) {
      avatarText.innerHTML = `<img src="${user.avatar}" alt="avatar">`;
    } else {
      avatarText.innerText = user.name.charAt(0).toUpperCase();
    }
  }
}

function showApp(user) {
  registerPage.style.display = "none";
  app.style.display = "block";

  userName.innerText = user.name;
  userJob.innerText = user.job;
  updateAvatarDisplay(user);

  loadData();
}

/* ─── SETTINGS DATA ─── */
function loadSettingsData() {
  let user = JSON.parse(localStorage.getItem("user")) || {};

  document.getElementById('settingsName').innerText = user.name || '—';
  document.getElementById('settingsEmail').innerText = user.email || '—';
  updateAvatarDisplay(user);

  document.getElementById('editName').value = user.name || '';
  document.getElementById('editJob').value = user.job || '';
  document.getElementById('editEmail').value = user.email || '';
  document.getElementById('editBio').value = user.bio || '';
  document.getElementById('editLocation').value = user.location || '';
  document.getElementById('editWebsite').value = user.website || '';
  document.getElementById('editPhone').value = user.phone || '';

  // Verification badge
  let badge = document.getElementById('verifyBadge');
  if (user.verified) {
    badge.className = 'verification-badge verified';
    badge.innerText = 'Verified';
    document.getElementById('emailVerifyBtn').innerText = 'Verified';
    document.getElementById('emailVerifyBtn').className = 'btn btn-sm btn-success';
    document.getElementById('emailVerifyBtn').disabled = true;
  } else {
    badge.className = 'verification-badge unverified';
    badge.innerText = 'Unverified';
    document.getElementById('emailVerifyBtn').innerText = 'Verify';
    document.getElementById('emailVerifyBtn').className = 'btn btn-sm btn-success';
    document.getElementById('emailVerifyBtn').disabled = false;
  }

  // Load preferences
  loadPreferences();
}

function saveProfile() {
  let user = JSON.parse(localStorage.getItem("user")) || {};
  user.name = document.getElementById('editName').value.trim();
  user.job = document.getElementById('editJob').value.trim();
  user.bio = document.getElementById('editBio').value.trim();
  user.location = document.getElementById('editLocation').value.trim();
  user.website = document.getElementById('editWebsite').value.trim();

  localStorage.setItem("user", JSON.stringify(user));

  userName.innerText = user.name;
  userJob.innerText = user.job;
  updateAvatarDisplay(user);

  loadSettingsData();
  showToast("Profile updated successfully!", "success");
}

function saveContact() {
  let user = JSON.parse(localStorage.getItem("user")) || {};
  let email = document.getElementById('editEmail').value.trim();
  let phone = document.getElementById('editPhone').value.trim();

  clearFieldErrors();

  if (email && !isValidEmail(email)) {
    showFieldError('editEmail', 'Please enter a valid email address');
    showToast("Please enter a valid email address", "error");
    return;
  }

  user.email = email;
  user.phone = phone;
  localStorage.setItem("user", JSON.stringify(user));
  loadSettingsData();
  showToast("Contact information updated!", "success");
}

function updateAvatar(input) {
  let file = input.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast("Image must be under 2MB", "error");
    return;
  }

  let reader = new FileReader();
  reader.onload = function() {
    let user = JSON.parse(localStorage.getItem("user")) || {};
    user.avatar = reader.result;
    localStorage.setItem("user", JSON.stringify(user));
    updateAvatarDisplay(user);
    showToast("Avatar updated!", "success");
  };
  reader.readAsDataURL(file);
}

/* ─── SECURITY ─── */
function verifyEmail() {
  let user = JSON.parse(localStorage.getItem("user")) || {};
  user.verified = true;
  localStorage.setItem("user", JSON.stringify(user));
  loadSettingsData();
  showToast("Email verified successfully!", "success");
}

function verifyPhone() {
  showToast("Phone verification sent! Check your messages.", "success");
  setTimeout(() => {
    let btn = document.getElementById('phoneVerifyBtn');
    btn.innerText = 'Verified';
    btn.className = 'btn btn-sm btn-success';
    btn.disabled = true;
  }, 2000);
}

function toggle2FA() {
  let toggle = document.getElementById('toggle2FA');
  toggle.classList.toggle('on');
  let isOn = toggle.classList.contains('on');
  toggle.setAttribute('aria-checked', isOn);

  let user = JSON.parse(localStorage.getItem("user")) || {};
  user.twoFA = isOn;
  localStorage.setItem("user", JSON.stringify(user));

  showToast(isOn ? "2FA enabled!" : "2FA disabled", "success");
}

function changePassword() {
  let current = document.getElementById('currentPassword').value;
  let newPass = document.getElementById('newPassword').value;
  let confirm = document.getElementById('confirmPassword').value;

  clearFieldErrors();

  if (!current || !newPass || !confirm) {
    showToast("Please fill all password fields", "error");
    return;
  }
  if (newPass.length < 8) {
    showFieldError('newPassword', 'Password must be at least 8 characters');
    showToast("Password must be at least 8 characters", "error");
    return;
  }
  if (newPass !== confirm) {
    showFieldError('confirmPassword', 'Passwords do not match');
    showToast("Passwords do not match", "error");
    return;
  }

  let user = JSON.parse(localStorage.getItem("user")) || {};
  if (user.password && current !== user.password) {
    showFieldError('currentPassword', 'Current password is incorrect');
    showToast("Current password is incorrect", "error");
    return;
  }

  user.password = newPass;
  localStorage.setItem("user", JSON.stringify(user));

  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  showToast("Password updated successfully!", "success");
}

/* ─── PREFERENCES ─── */
function toggleSetting(key) {
  let toggleMap = {
    'compact': 'toggleCompact',
    'animations': 'toggleAnim',
    'notifExp': 'toggleNotifExp',
    'notifSec': 'toggleNotifSec',
    'notifMark': 'toggleNotifMark'
  };
  let el = document.getElementById(toggleMap[key]);
  el.classList.toggle('on');
  let isOn = el.classList.contains('on');
  el.setAttribute('aria-checked', isOn);

  // Save to localStorage
  let prefs = JSON.parse(localStorage.getItem('preferences')) || {};
  prefs[key] = isOn;
  localStorage.setItem('preferences', JSON.stringify(prefs));

  // Apply compact mode immediately
  if (key === 'compact') {
    document.body.classList.toggle('compact-mode', isOn);
  }

  showToast("Preference saved", "success");
}

function loadPreferences() {
  let prefs = JSON.parse(localStorage.getItem('preferences')) || {};
  let toggleMap = {
    'compact': 'toggleCompact',
    'animations': 'toggleAnim',
    'notifExp': 'toggleNotifExp',
    'notifSec': 'toggleNotifSec',
    'notifMark': 'toggleNotifMark'
  };

  for (let [key, id] of Object.entries(toggleMap)) {
    let el = document.getElementById(id);
    let isOn = prefs[key] !== undefined ? prefs[key] : el.classList.contains('on');
    el.classList.toggle('on', isOn);
    el.setAttribute('aria-checked', isOn);
  }

  // Apply compact mode
  if (prefs.compact) {
    document.body.classList.add('compact-mode');
  }
}

function savePreferences() {
  let prefs = JSON.parse(localStorage.getItem('preferences')) || {};
  prefs.language = document.getElementById('langSelect').value;
  prefs.timezone = document.getElementById('tzSelect').value;
  localStorage.setItem('preferences', JSON.stringify(prefs));
  showToast("Preferences saved!", "success");
}

/* ─── DANGER ZONE ─── */
function showDeleteModal() {
  document.getElementById('deleteModal').classList.add('active');
}

function hideDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  document.getElementById('deleteConfirm').value = '';
}

function confirmDelete() {
  if (document.getElementById('deleteConfirm').value !== 'DELETE') {
    showToast("Please type DELETE to confirm", "error");
    return;
  }
  localStorage.clear();
  hideDeleteModal();
  location.reload();
}

function showClearModal() {
  document.getElementById('clearModal').classList.add('active');
}

function hideClearModal() {
  document.getElementById('clearModal').classList.remove('active');
}

function confirmClear() {
  localStorage.removeItem("projects");
  hideClearModal();
  showToast("All experiences cleared", "success");
  if (!settingsPage.classList.contains('active')) {
    loadData();
  }
}

function clearAllData() {
  // Kept for backwards compatibility, now shows modal
  showClearModal();
}

function exportData() {
  let data = {
    user: JSON.parse(localStorage.getItem("user")),
    projects: JSON.parse(localStorage.getItem("projects")) || []
  };
  let blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = 'portfolio-data.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast("Data exported!", "success");
}

/* ─── EXPERIENCE ─── */
let isEditing = false;

function loadData() {
  list.innerHTML = "";
  loading.style.display = "flex";

  // Simulate a brief loading state then show immediately
  requestAnimationFrame(() => {
    loading.style.display = "none";

    let data = JSON.parse(localStorage.getItem("projects")) || [];
    data = data.filter(item => item && item.title && item.company);
    localStorage.setItem("projects", JSON.stringify(data));

    countBadge.innerText = data.length + " item" + (data.length !== 1 ? "s" : "");

    if (data.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">&#128193;</div>
          <h3>No experiences yet</h3>
          <p>Add your first work experience using the form on the left</p>
        </div>
      `;
      return;
    }

    data.forEach((item, index) => {
      let div = document.createElement("div");
      div.className = "card";

      let preview = `<div class="preview">&#128196;</div>`;
      if (item.fileData && item.fileData.startsWith("data:image")) {
        preview = `<div class="preview"><img src="${item.fileData}" alt=""></div>`;
      } else if (item.fileName) {
        const ext = item.fileName.split('.').pop().toLowerCase();
        const iconMap = { pdf: '&#128213;', doc: '&#128209;', docx: '&#128209;' };
        preview = `<div class="preview">${iconMap[ext] || '&#128196;'}</div>`;
      }

      let dateRange = '';
      if (item.startDate || item.endDate) {
        let start = item.startDate ? formatDate(item.startDate) : '';
        let end = item.currentJob ? 'Present' : (item.endDate ? formatDate(item.endDate) : '');
        if (start || end) {
          dateRange = `<div class="card-dates">${start}${start && end ? ' — ' : ''}${end}</div>`;
        }
      }

      div.innerHTML = `
        ${preview}
        <div class="card-info">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.company)}</p>
          ${dateRange}
          <div class="card-meta">
            <span>${item.fileName || "No attachment"}</span>
            ${item.fileName ? '<span class="dot"></span><span>' + getFileSize(item.fileData) + '</span>' : ''}
          </div>
        </div>
        <div class="card-actions">
          <button type="button" class="edit-btn" onclick="editProject(${index})">Edit</button>
          <button type="button" class="delete-btn" onclick="deleteProject(${index})">Remove</button>
        </div>
      `;

      list.appendChild(div);
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  let d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function addExperience() {
  let title = document.getElementById("title").value.trim();
  let company = document.getElementById("company").value.trim();
  let startDate = document.getElementById("startDate").value;
  let endDate = document.getElementById("endDate").value;
  let currentJob = document.getElementById("currentJob").checked;
  let file = document.getElementById("fileInput").files[0];
  let editIndex = document.getElementById("editIndex").value;

  clearFieldErrors();

  if (!title || !company) {
    showToast("Please fill in job title and company", "error");
    if (!title) showFieldError('title', 'Required');
    if (!company) showFieldError('company', 'Required');
    return;
  }

  let reader = new FileReader();

  reader.onload = function () {
    let data = JSON.parse(localStorage.getItem("projects")) || [];

    let entry = {
      title, company, startDate, endDate, currentJob,
      fileName: file ? file.name : null,
      fileData: file ? reader.result : null
    };

    if (editIndex !== '') {
      // Preserve existing file if no new file uploaded
      let existing = data[parseInt(editIndex)];
      if (!file && existing) {
        entry.fileName = existing.fileName;
        entry.fileData = existing.fileData;
      }
      data[parseInt(editIndex)] = entry;
      showToast("Experience updated successfully!", "success");
    } else {
      data.unshift(entry);
      showToast("Experience added successfully!", "success");
    }

    localStorage.setItem("projects", JSON.stringify(data));
    resetForm();
    loadData();
  };

  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      showToast("File must be under 2MB", "error");
      return;
    }
    reader.readAsDataURL(file);
  } else {
    reader.onload();
  }
}

function editProject(index) {
  let data = JSON.parse(localStorage.getItem("projects")) || [];
  let item = data[index];
  if (!item) return;

  document.getElementById("title").value = item.title || '';
  document.getElementById("company").value = item.company || '';
  document.getElementById("startDate").value = item.startDate || '';
  document.getElementById("endDate").value = item.endDate || '';
  document.getElementById("currentJob").checked = item.currentJob || false;
  document.getElementById("editIndex").value = index;
  document.getElementById("fileInput").value = '';

  document.getElementById("formTitle").innerText = "Edit Experience";
  document.getElementById("formSubtitle").innerText = "Update Entry";
  document.getElementById("addBtn").innerText = "Save Changes";
  document.getElementById("cancelEditBtn").style.display = "block";

  isEditing = true;

  // Scroll to form on mobile
  document.querySelector('.left-panel').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  document.getElementById("title").value = "";
  document.getElementById("company").value = "";
  document.getElementById("startDate").value = "";
  document.getElementById("endDate").value = "";
  document.getElementById("currentJob").checked = false;
  document.getElementById("fileInput").value = "";
  document.getElementById("editIndex").value = "";

  document.getElementById("formTitle").innerText = "Add Experience";
  document.getElementById("formSubtitle").innerText = "New Entry";
  document.getElementById("addBtn").innerText = "Add Experience";
  document.getElementById("cancelEditBtn").style.display = "none";

  isEditing = false;
  clearFieldErrors();
}

function deleteProject(index) {
  let data = JSON.parse(localStorage.getItem("projects")) || [];
  data.splice(index, 1);
  localStorage.setItem("projects", JSON.stringify(data));
  loadData();
  showToast("Experience removed", "success");
}

function showLogoutModal() {
  document.getElementById('logoutModal').classList.add('active');
}

function hideLogoutModal() {
  document.getElementById('logoutModal').classList.remove('active');
}

function confirmLogout() {
  hideLogoutModal();
  localStorage.removeItem("user");
  // DO NOT remove projects - preserve user data
  app.style.display = "none";
  registerPage.style.display = "flex";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("job").value = "";
  document.getElementById("regPassword").value = "";
  showToast("Signed out successfully. Your data is safe.", "success");
}

/* ─── UTILS ─── */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFileSize(dataUrl) {
  if (!dataUrl) return '';
  const base64 = dataUrl.split(',')[1];
  if (!base64) return '';
  const bytes = (base64.length * 3) / 4;
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function showToast(message, type) {
  toastEl.innerHTML = (type === 'success' ? '&#10003; ' : '&#10005; ') + message;
  toastEl.className = 'toast ' + type + ' show';
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}

function showFieldError(fieldId, message) {
  let errorEl = document.getElementById(fieldId + 'Error');
  if (errorEl) {
    errorEl.innerText = message;
  }
  let input = document.getElementById(fieldId);
  if (input) {
    input.style.borderColor = 'var(--danger)';
    input.addEventListener('input', function handler() {
      input.style.borderColor = '';
      if (errorEl) errorEl.innerText = '';
      input.removeEventListener('input', handler);
    });
  }
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.innerText = '');
  document.querySelectorAll('input, textarea, select').forEach(el => el.style.borderColor = '');
}

function highlightEmptyFields(ids) {
  ids.forEach(id => {
    let el = document.getElementById(id);
    if (el && !el.value.trim()) {
      el.style.borderColor = 'var(--danger)';
      el.addEventListener('input', function handler() {
        el.style.borderColor = '';
        el.removeEventListener('input', handler);
      });
    }
  });
}

/* ─── PUBLIC PROFILE ─── */
function openPublicProfile() {
  let user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    showToast("No profile to display. Create an account first.", "error");
    return;
  }
  window.open(window.location.pathname + '#view', '_blank');
}

function checkHash() {
  let hash = window.location.hash;
  if (hash === '#view') {
    let user = localStorage.getItem("user");
    if (user) {
      showPublicProfile();
    } else {
      showPublicNotFound();
    }
  }
}

function showPublicProfile() {
  let user = JSON.parse(localStorage.getItem("user"));
  let projects = JSON.parse(localStorage.getItem("projects")) || [];

  if (!user) {
    showPublicNotFound();
    return;
  }

  // Hide everything else
  registerPage.style.display = 'none';
  app.style.display = 'none';
  document.getElementById('publicNotFound').classList.remove('active');

  // Show public profile
  let publicPage = document.getElementById('publicProfilePage');
  publicPage.classList.add('active');

  // Populate user info
  document.getElementById('publicName').innerText = user.name || 'Anonymous';
  document.getElementById('publicJob').innerText = user.job || '';
  document.getElementById('publicBio').innerText = user.bio || '';

  let avatarEl = document.getElementById('publicAvatar');
  if (user.avatar) {
    avatarEl.innerHTML = `<img src="${user.avatar}" alt="">`;
  } else {
    avatarEl.innerText = (user.name || '?').charAt(0).toUpperCase();
  }

  // Show/hide meta items
  if (user.location) {
    document.getElementById('publicLocation').innerText = user.location;
    document.getElementById('publicLocationWrap').style.display = 'flex';
  } else {
    document.getElementById('publicLocationWrap').style.display = 'none';
  }
  if (user.website) {
    document.getElementById('publicWebsite').href = user.website;
    document.getElementById('publicWebsiteWrap').style.display = 'flex';
  } else {
    document.getElementById('publicWebsiteWrap').style.display = 'none';
  }
  if (user.email) {
    document.getElementById('publicEmail').href = 'mailto:' + user.email;
    document.getElementById('publicEmailWrap').style.display = 'flex';
  } else {
    document.getElementById('publicEmailWrap').style.display = 'none';
  }
  if (user.phone) {
    document.getElementById('publicPhone').innerText = user.phone;
    document.getElementById('publicPhoneWrap').style.display = 'flex';
  } else {
    document.getElementById('publicPhoneWrap').style.display = 'none';
  }
  if (user.verified) {
    document.getElementById('publicVerifiedWrap').style.display = 'flex';
  } else {
    document.getElementById('publicVerifiedWrap').style.display = 'none';
  }

  document.getElementById('publicExpCount').innerText = projects.length;
  document.getElementById('publicMemberSince').innerText = user.memberSince || '—';

  // Populate experiences
  let listEl = document.getElementById('publicList');
  listEl.innerHTML = '';

  projects = projects.filter(item => item && item.title && item.company);

  if (projects.length === 0) {
    listEl.innerHTML = `
      <div class="public-empty">
        <div class="public-empty-icon">&#128193;</div>
        <h3 style="color:rgba(255,255,255,0.7);margin-bottom:8px;">No experiences yet</h3>
        <p>This user hasn't added any work experiences.</p>
      </div>
    `;
    return;
  }

  projects.forEach(item => {
    let div = document.createElement('div');
    div.className = 'public-card';

    let preview = `<div class="public-card-preview">&#128196;</div>`;
    if (item.fileData && item.fileData.startsWith("data:image")) {
      preview = `<div class="public-card-preview"><img src="${item.fileData}" alt=""></div>`;
    } else if (item.fileName) {
      const ext = item.fileName.split('.').pop().toLowerCase();
      const iconMap = { pdf: '&#128213;', doc: '&#128209;', docx: '&#128209;' };
      preview = `<div class="public-card-preview">${iconMap[ext] || '&#128196;'}</div>`;
    }

    let dateRange = '';
    if (item.startDate || item.endDate) {
      let start = item.startDate ? formatDate(item.startDate) : '';
      let end = item.currentJob ? 'Present' : (item.endDate ? formatDate(item.endDate) : '');
      if (start || end) {
        dateRange = `<div class="public-card-dates">${start}${start && end ? ' — ' : ''}${end}</div>`;
      }
    }

    div.innerHTML = `
      <div class="public-card-header">
        ${preview}
        <div class="public-card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.company)}</p>
          ${dateRange}
          <div class="public-card-meta">
            <span>${item.fileName || "No attachment"}</span>
            ${item.fileName ? '<span class="dot"></span><span>' + getFileSize(item.fileData) + '</span>' : ''}
          </div>
        </div>
      </div>
    `;

    listEl.appendChild(div);
  });
}

function showPublicNotFound() {
  registerPage.style.display = 'none';
  app.style.display = 'none';
  document.getElementById('publicProfilePage').classList.remove('active');
  document.getElementById('publicNotFound').classList.add('active');
}

// Listen for hash changes
window.addEventListener('hashchange', checkHash);

// Keyboard support for modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideLogoutModal();
    hideDeleteModal();
    hideClearModal();
  }
});

// Keyboard support for toggle switches
document.querySelectorAll('.toggle-switch').forEach(toggle => {
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });
});

// Check if we're in public view mode
checkHash();

initApp();