//details
const API_BASE = "http://localhost:3000";
let editingUserId = null;

const overlay = document.getElementById("overlay");
const form = document.getElementById("formContainer");
const messageDiv = document.getElementById("message");

//--------------------------------------------------
// SHOW MESSAGE
//--------------------------------------------------
function showMessage(text, type = "success") {
  messageDiv.innerText = text;
  messageDiv.className = type === "success" ? "success" : "error";
  messageDiv.style.display = "block";
  setTimeout(() => (messageDiv.style.display = "none"), 3000);
}

//--------------------------------------------------
// RENDER GRID
//--------------------------------------------------
export async function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  try {
    const users = await fetch(`${API_BASE}/api/users`).then((r) => r.json());

    users.forEach((u) => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <strong>${u.username}</strong><br>
        ${u.email}<br><br>
        <b>Role:</b> ${u.role}<br>
        <button class="modifyBtn">Modify</button>
        <button class="deleteBtn">Delete</button>
      `;

      // DELETE USER
      div.querySelector(".deleteBtn").onclick = async () => {
        await fetch(`${API_BASE}/api/users/${u.UserId}`, { method: "DELETE" });
        showMessage("User deleted", "success");
        renderGrid();
      };

      // MODIFY USER
      div.querySelector(".modifyBtn").onclick = () => {
        editingUserId = u.UserId;

        document.getElementById("formTitle").innerText = "Modify User";
        document.getElementById("uName").value = u.username;
        document.getElementById("uEmail").value = u.email;
        document.getElementById("uPassword").value = "";

        overlay.style.display = "block";
        form.style.display = "block";
      };

      grid.appendChild(div);
    });
  } catch {
    showMessage("Failed to load users", "error");
  }
}

//--------------------------------------------------
// SHOW FORM (ADD USER)
//--------------------------------------------------
document.getElementById("addBtn").onclick = () => {
  editingUserId = null;
  document.getElementById("formTitle").innerText = "Create User";
  document.getElementById("uName").value = "";
  document.getElementById("uEmail").value = "";
  document.getElementById("uPassword").value = "";

  overlay.style.display = "block";
  form.style.display = "block";
};

// close modal when clicking outside
overlay.onclick = () => {
  overlay.style.display = "none";
  form.style.display = "none";
};

//--------------------------------------------------
// CREATE OR MODIFY USER
//--------------------------------------------------
document.getElementById("createBtn").onclick = async () => {
  const username = document.getElementById("uName").value;
  const email = document.getElementById("uEmail").value;
  const password = document.getElementById("uPassword").value;

  // hash password in frontend
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;

  const userData = {
    username,
    email,
    passwordHash,
  };

  try {
    let response;

    if (editingUserId) {
      // MODIFY
      response = await fetch(`${API_BASE}/api/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    } else {
      // CREATE
      response = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    }

    const result = await response.json();

    if (result.success) {
      alert("User saved successfully!");
      showMessage("User saved!", "success");
    } else {
      alert("Some fields failed: " + result.failedAttributes.join(", "));
      showMessage("Update failed", "error");
    }

    overlay.style.display = "none";
    form.style.display = "none";
    editingUserId = null;

    renderGrid();
  } catch (e) {
    showMessage("Error saving user", "error");
  }
};

//--------------------------------------------------
// INITIAL LOAD
//--------------------------------------------------
renderGrid();
