
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

function switchSettingsTab(tab) {
  document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));

  event.target.classList.add('active');
  document.getElementById('tab-' + tab).classList.add('active');
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
  } else {
    registerPage.style.display = "flex";
  }
}

function register() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let job = document.getElementById("job").value.trim();

  if (!name || !email || !job) {
    showToast("Please fill in all fields", "error");
    return;
  }

  let user = { name, email, job, verified: false, bio: '', location: '', website: '', phone: '', memberSince: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
  localStorage.setItem("user", JSON.stringify(user));
  showApp(user);
  showToast("Account created successfully!", "success");
}

function showApp(user) {
  registerPage.style.display = "none";
  app.style.display = "block";

  userName.innerText = user.name;
  userJob.innerText = user.job;
  userAvatar.innerText = user.name.charAt(0).toUpperCase();

  loadData();
}

/* ─── SETTINGS DATA ─── */
function loadSettingsData() {
  let user = JSON.parse(localStorage.getItem("user")) || {};

  document.getElementById('settingsName').innerText = user.name || '—';
  document.getElementById('settingsEmail').innerText = user.email || '—';
  document.getElementById('settingsAvatarText').innerText = (user.name || '?').charAt(0).toUpperCase();

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
  userAvatar.innerText = user.name.charAt(0).toUpperCase();

  loadSettingsData();
  showToast("Profile updated successfully!", "success");
}

function saveContact() {
  let user = JSON.parse(localStorage.getItem("user")) || {};
  user.email = document.getElementById('editEmail').value.trim();
  user.phone = document.getElementById('editPhone').value.trim();
  localStorage.setItem("user", JSON.stringify(user));
  loadSettingsData();
  showToast("Contact information updated!", "success");
}

function updateAvatar(input) {
  let file = input.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function() {
    let user = JSON.parse(localStorage.getItem("user")) || {};
    user.avatar = reader.result;
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById('settingsAvatarText').innerHTML = `<img src="${reader.result}">`;
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
  showToast(toggle.classList.contains('on') ? "2FA enabled!" : "2FA disabled", "success");
}

function changePassword() {
  let current = document.getElementById('currentPassword').value;
  let newPass = document.getElementById('newPassword').value;
  let confirm = document.getElementById('confirmPassword').value;

  if (!current || !newPass || !confirm) {
    showToast("Please fill all password fields", "error");
    return;
  }
  if (newPass.length < 8) {
    showToast("Password must be at least 8 characters", "error");
    return;
  }
  if (newPass !== confirm) {
    showToast("Passwords do not match", "error");
    return;
  }

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
  showToast("Preference saved", "success");
}

function savePreferences() {
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

function clearAllData() {
  localStorage.removeItem("projects");
  showToast("All experiences cleared", "success");
  if (!settingsPage.classList.contains('active')) {
    loadData();
  }
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

/* ─── EXPERIENCE (original functions) ─── */
function loadData() {
  list.innerHTML = "";
  loading.style.display = "flex";

  setTimeout(() => {
    loading.style.display = "none";

    let data = JSON.parse(localStorage.getItem("projects")) || [];
    data = data.filter(item => item && item.title && item.company);
    localStorage.setItem("projects", JSON.stringify(data));

    countBadge.innerText = data.length + " item" + (data.length !== 1 ? "s" : "");

    if (data.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <h3>No experiences yet</h3>
          <p>Add your first work experience using the form on the left</p>
        </div>
      `;
      return;
    }

    data.forEach((item, index) => {
      let div = document.createElement("div");
      div.className = "card";

      let preview = `<div class="preview">📄</div>`;
      if (item.fileData && item.fileData.startsWith("data:image")) {
        preview = `<div class="preview"><img src="${item.fileData}"></div>`;
      } else if (item.fileName) {
        const ext = item.fileName.split('.').pop().toLowerCase();
        const iconMap = { pdf: '📕', doc: '📘', docx: '📘' };
        preview = `<div class="preview">${iconMap[ext] || '📄'}</div>`;
      }

      div.innerHTML = `
        ${preview}
        <div class="card-info">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.company)}</p>
          <div class="card-meta">
            <span>${item.fileName || "No attachment"}</span>
            ${item.fileName ? '<span class="dot"></span><span>' + getFileSize(item.fileData) + '</span>' : ''}
          </div>
        </div>
        <button class="delete-btn" onclick="deleteProject(${index})">Remove</button>
      `;

      list.appendChild(div);
    });

  }, 600);
}

function addExperience() {
  let title = document.getElementById("title").value.trim();
  let company = document.getElementById("company").value.trim();
  let file = document.getElementById("fileInput").files[0];

  if (!title || !company) {
    showToast("Please fill in job title and company", "error");
    return;
  }

  let reader = new FileReader();

  reader.onload = function () {
    let data = JSON.parse(localStorage.getItem("projects")) || [];

    data.unshift({
      title, company,
      fileName: file ? file.name : null,
      fileData: file ? reader.result : null
    });

    localStorage.setItem("projects", JSON.stringify(data));

    document.getElementById("title").value = "";
    document.getElementById("company").value = "";
    document.getElementById("fileInput").value = "";

    loadData();
    showToast("Experience added successfully!", "success");
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    reader.onload();
  }
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
  localStorage.removeItem("projects");
  app.style.display = "none";
  registerPage.style.display = "flex";
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("job").value = "";
  showToast("Signed out successfully", "success");
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
  toastEl.innerHTML = type === 'success' ? '✓ ' + message : '✕ ' + message;
  toastEl.className = 'toast ' + type + ' show';
  setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3000);
}



/* ─── PUBLIC PROFILE ─── */
function openPublicProfile() {
  // Open in new tab with hash
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
    showPublicProfile();
  } else if (hash === '#view' && !localStorage.getItem("user")) {
    showPublicNotFound();
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
    avatarEl.innerHTML = `<img src="${user.avatar}">`;
  } else {
    avatarEl.innerText = (user.name || '?').charAt(0).toUpperCase();
  }

  // Show/hide meta items
  if (user.location) {
    document.getElementById('publicLocation').innerText = user.location;
    document.getElementById('publicLocationWrap').style.display = 'flex';
  }
  if (user.website) {
    document.getElementById('publicWebsite').href = user.website;
    document.getElementById('publicWebsiteWrap').style.display = 'flex';
  }
  if (user.email) {
    document.getElementById('publicEmail').href = 'mailto:' + user.email;
    document.getElementById('publicEmailWrap').style.display = 'flex';
  }
  if (user.phone) {
    document.getElementById('publicPhone').innerText = user.phone;
    document.getElementById('publicPhoneWrap').style.display = 'flex';
  }
  if (user.verified) {
    document.getElementById('publicVerifiedWrap').style.display = 'flex';
  }

  // Populate experiences
  let listEl = document.getElementById('publicList');
  listEl.innerHTML = '';

  projects = projects.filter(item => item && item.title && item.company);

  if (projects.length === 0) {
    listEl.innerHTML = `
      <div class="public-empty">
        <div class="public-empty-icon">📂</div>
        <h3 style="color:rgba(255,255,255,0.7);margin-bottom:8px;">No experiences yet</h3>
        <p>This user hasn't added any work experiences.</p>
      </div>
    `;
    return;
  }

  projects.forEach(item => {
    let div = document.createElement('div');
    div.className = 'public-card';

    let preview = `<div class="public-card-preview">📄</div>`;
    if (item.fileData && item.fileData.startsWith("data:image")) {
      preview = `<div class="public-card-preview"><img src="${item.fileData}"></div>`;
    } else if (item.fileName) {
      const ext = item.fileName.split('.').pop().toLowerCase();
      const iconMap = { pdf: '📕', doc: '📘', docx: '📘' };
      preview = `<div class="public-card-preview">${iconMap[ext] || '📄'}</div>`;
    }

    div.innerHTML = `
      <div class="public-card-header">
        ${preview}
        <div class="public-card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.company)}</p>
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


// Check if we're in public view mode
checkHash();

initApp();