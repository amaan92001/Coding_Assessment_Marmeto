
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    fetchCartData();
});

async function fetchCartData() {
    const loader = document.getElementById("loader");
    loader.style.display = "block"; // Show loader

    try {
        const response = await fetch(
            "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"
        );
        const data = await response.json();
        displayCartItems(data.items);
        updateCartTotals(data.items);
        saveCartToLocalStorage(data.items);
    } catch (error) {
        console.error("Error fetching cart data:", error);
    } finally {
        loader.style.display = "none"; 
    }
}

function displayCartItems(items) {
    const cartItemsContainer = document.getElementById("cart-items");
    cartItemsContainer.innerHTML = ""; 
    items.forEach((item) => {
        const itemElement = document.createElement("tr");
        itemElement.classList.add("cart-item");
        itemElement.innerHTML = `
            <td>
                <img src="${item.image}" alt="${item.title}">
                ${item.title}
            </td>
            <td>Rs. ${(item.price / 100).toFixed(2)}</td>
            <td>
                <input type="number" value="${
                    item.quantity
                }" min="1" onchange="updateSubtotal(this, ${item.price})">
            </td>
            <td class="subtotal">Rs. ${(item.line_price / 100).toFixed(2)}</td>
            <td>
                <button onclick="confirmRemoveItem(this)">
<!-- Dustbin icon -->
<svg
xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
fill="currentColor"
class="bi bi-trash"
viewBox="0 0 16 16"
>
<path d="M2.5 0a.5.5 0 0 1 .5.5V1h10V.5a.5.5 0 0 1 1 0V1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h1V.5a.5.5 0 0 1 .5-.5zM1 4h14v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm3 1v8h1V5H4zm3 0v8h1V5H7zm3 0v8h1V5h-1z" />
</svg>
</button>
            </td>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
    updateCartTotals(items);
}

function confirmRemoveItem(button) {
    const itemElement = button.closest("tr");
    const modal = document.getElementById("remove-modal");
    modal.style.display = "flex";
    document.getElementById("confirm-remove").onclick = () => {
        itemElement.remove();
        modal.style.display = "none";
        updateCartTotalsFromDOM();
        saveCartToLocalStorage(getCurrentCartItems());
    };
    document.getElementById("cancel-remove").onclick = () => {
        modal.style.display = "none";
    };
}

function updateCartTotals(items) {
    const subtotalElement = document.getElementById("subtotal");
    const totalElement = document.getElementById("total");
    const subtotal = items.reduce(
        (total, item) => total + item.line_price,
        0
    );
    subtotalElement.innerText = `Rs. ${(subtotal / 100).toFixed(2)}`;
    totalElement.innerText = `Rs. ${(subtotal / 100).toFixed(2)}`;
}

function updateSubtotal(input, price) {
    const quantity = input.value;
    const subtotalElement = input.closest("tr").querySelector(".subtotal");
    const newSubtotal = (quantity * price) / 100;
    subtotalElement.innerText = `Rs. ${newSubtotal.toFixed(2)}`;
    updateCartTotalsFromDOM();
    saveCartToLocalStorage(getCurrentCartItems());
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
        const items = JSON.parse(savedCart);
        displayCartItems(items);
        updateCartTotals(items);
    }
}

function saveCartToLocalStorage(items) {
    console.log("Saving cart to local storage:", items); // Debug log
    localStorage.setItem("cart", JSON.stringify(items));
}

function getCurrentCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartItems = [];
    cartItemsContainer
        .querySelectorAll(".cart-item")
        .forEach((itemElement) => {
            const image = itemElement.querySelector("img").src;
            const title = itemElement.querySelector("td").innerText.trim();
            const price =
                parseFloat(
                    itemElement
                        .querySelector("td:nth-child(2)")
                        .innerText.replace("Rs. ", "")
                ) * 100;
            const quantity = parseInt(itemElement.querySelector("input").value);
            const line_price = price * quantity;
            cartItems.push({ image, title, price, quantity, line_price });
        });
    console.log("Current cart items:", cartItems); // Debug log
    return cartItems;
}

function updateCartTotalsFromDOM() {
    const items = getCurrentCartItems();
    updateCartTotals(items);
}
