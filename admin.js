const dbClient = window.supabase.createClient(
  'https://fiyumrqncvgwuczalgqc.supabase.co',
  'sb_publishable_XPNEWHWhX_tEMPKvGr63Qw_Ekm92Doz'
);

let currentAdmin = null;

async function checkAdminAccess() {

  const {
    data: { user }
  } = await dbClient.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentAdmin = user;

  const { data, error } = await dbClient
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {

    document.body.innerHTML = `
      <div style="padding:40px;text-align:center;">
        <h1>Access Denied</h1>
        <p>You are not an administrator.</p>
      </div>
    `;

    return;
  }

  document.getElementById("status").style.display = "none";
  document.getElementById("admin-content").style.display = "block";

  loadOrders();
}

async function loadOrders() {

  const { data, error } = await dbClient
    .from("admin_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert("Unable to load orders");
    return;
  }

  updateStats(data);
  renderOrders(data);
}

function updateStats(orders) {

  const total = orders.length;

  const pending = orders.filter(order =>
    order.order_status === "Pending"
  ).length;

  const delivered = orders.filter(order =>
    order.order_status === "Delivered"
  ).length;

  document.getElementById("total-orders").textContent = total;
  document.getElementById("pending-orders").textContent = pending;
  document.getElementById("delivered-orders").textContent = delivered;
}

function renderOrders(orders) {

  const tbody = document.getElementById("orders-body");

  if (!orders.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          No orders found
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = "";

  orders.forEach(order => {

    tbody.innerHTML += `
      <tr>

        <td>
          <div class="customer-info">
            <strong>${order.customer_name || "Unknown"}</strong><br>
            ${order.phone || "-"}<br>
            ${order.address || "-"}
          </div>
        </td>

        <td class="product-cell">
          ${order.product_name}
        </td>

        <td>
          ₹${order.total_price}
        </td>

        <td>
          <select
            class="status-select"
            id="status-${order.id}"
          >
            <option ${order.order_status === "Pending" ? "selected" : ""}>
              Pending
            </option>

            <option ${order.order_status === "Confirmed" ? "selected" : ""}>
              Confirmed
            </option>

            <option ${order.order_status === "Preparing" ? "selected" : ""}>
              Preparing
            </option>

            <option ${order.order_status === "Out for Delivery" ? "selected" : ""}>
              Out for Delivery
            </option>

            <option ${order.order_status === "Delivered" ? "selected" : ""}>
              Delivered
            </option>

          </select>
        </td>

        <td>
          ${new Date(order.created_at).toLocaleString()}
        </td>

        <td>
          <button
            class="save-btn"
            onclick="updateOrderStatus('${order.id}')"
          >
            Save
          </button>
        </td>

      </tr>
    `;
  });
}

async function updateOrderStatus(orderId) {

  const status = document.getElementById(
    `status-${orderId}`
  ).value;

  const { error } = await dbClient
    .from("orders")
    .update({
      order_status: status
    })
    .eq("id", orderId);

  if (error) {
    alert("Update failed");
    console.error(error);
    return;
  }

  alert("Order updated successfully");
  loadOrders();
}

async function logoutAdmin() {

  await dbClient.auth.signOut();

  window.location.href = "login.html";
}

checkAdminAccess();