const API_BASE = "http://localhost:3000";
let editingProductId = null;

const overlay = document.getElementById("overlay");
const form = document.getElementById("formContainer");
const messageDiv = document.getElementById("message");

//--------------------------------------------------
// HELPER: Show message
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
    const products = await fetch(`${API_BASE}/api/products`).then((r) =>
      r.json()
    );

    products.forEach((p) => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <strong>${p.name}</strong><br>
        ${p.description}<br><br>
        <b>Price:</b> $${p.price}<br>
        <b>Category:</b> ${p.category}<br>
        <b>Stock:</b> ${p.stock}<br>
        <button class="modifyBtn">Modify</button>
        <button class="deleteBtn">Delete</button>
      `;

      // DELETE
      div.querySelector(".deleteBtn").onclick = async () => {
        try {
          await fetch(`${API_BASE}/api/products/${p.productId}`, {
            method: "DELETE",
          });
          showMessage("Product deleted successfully", "success");
          renderGrid();
        } catch {
          showMessage("Failed to delete product", "error");
        }
      };

      // MODIFY
      div.querySelector(".modifyBtn").onclick = () => {
        editingProductId = p.productId;
        document.getElementById("formTitle").innerText = "Modify Product";
        document.getElementById("pName").value = p.name;
        document.getElementById("pDesc").value = p.description;
        document.getElementById("pPrice").value = p.price;
        document.getElementById("pSeller").value = p.sellerId;
        document.getElementById("pCategory").value = p.category;
        document.getElementById("pStock").value = p.stock;
        overlay.style.display = "block";
        form.style.display = "block";
      };

      grid.appendChild(div);
    });
  } catch {
    showMessage("Failed to load products", "error");
  }
}

//--------------------------------------------------
// SHOW/HIDE FORM
//--------------------------------------------------
document.getElementById("addBtn").onclick = () => {
  editingProductId = null;
  document.getElementById("formTitle").innerText = "Create Product";
  document.getElementById("pName").value = "";
  document.getElementById("pDesc").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pSeller").value = "";
  document.getElementById("pCategory").value = "";
  document.getElementById("pStock").value = "";
  overlay.style.display = "block";
  form.style.display = "block";
};

// Click outside form to close
overlay.onclick = () => {
  form.style.display = "none";
  overlay.style.display = "none";
  editingProductId = null;
};

//--------------------------------------------------
// CREATE OR MODIFY PRODUCT
//--------------------------------------------------
document.getElementById("createBtn").onclick = async () => {
  const product = {
    name: document.getElementById("pName").value,
    description: document.getElementById("pDesc").value,
    price: Number(document.getElementById("pPrice").value),
    sellerId: Number(document.getElementById("pSeller").value),
    category: document.getElementById("pCategory").value,
    stock: Number(document.getElementById("pStock").value),
  };

  try {
    let response;
    let action = "added";

    if (editingProductId) {
      response = await fetch(`${API_BASE}/api/products/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      action = "updated";
    } else {
      response = await fetch(`${API_BASE}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    }

    const result = await response.json();

    // Show concise alert
    if (result.success) {
      alert(
        `Product ${action} successfully! (ID: ${result.product.productId})`
      );
      showMessage("Product saved successfully", "success");
    } else {
      alert(
        `Product ${action} failed for attributes: ${result.failedAttributes.join(
          ", "
        )}`
      );
      showMessage(
        `Some fields failed: ${result.failedAttributes.join(", ")}`,
        "error"
      );
    }

    // Close modal and refresh UI
    form.style.display = "none";
    overlay.style.display = "none";
    editingProductId = null;

    renderGrid();
  } catch (err) {
    alert("Failed to save product. Please try again.");
    showMessage("Failed to save product", "error");
  }
};

//--------------------------------------------------
// INITIAL LOAD
//--------------------------------------------------
renderGrid();
