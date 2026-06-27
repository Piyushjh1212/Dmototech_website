
        let homeCartItems = [];

        // === CART SIDE DRAWER CONTROLLER ===
        function toggleCartDrawer() {
            const drawer = document.getElementById('cartDrawer');
            const overlay = document.getElementById('cartOverlay');
            if (drawer && overlay) {
                drawer.classList.toggle('open');
                overlay.classList.toggle('open');
            }
        }

        // === MOBILE RESPONSIVE NAVBAR CONTROLLER ===
        function toggleMobileNav() {
            const panel = document.getElementById('mobileNavPanel');
            const overlay = document.getElementById('mobileNavOverlay');
            if (panel && overlay) {
                panel.classList.toggle('open');
                overlay.classList.toggle('open');
            }
        }

        // === READ ENGINE AND UI RE-BUILD FUNCTION ===
        function forceSyncHomeCart() {
            homeCartItems = JSON.parse(localStorage.getItem('dochaki_cart')) || [];

            const container = document.getElementById('cartDrawerContainer');
            const badge = document.getElementById('headerCartCount');
            const subCount = document.getElementById('cartDrawerSubCount');
            const footerTotal = document.getElementById('cartDrawerTotal');

            let totalCount = 0;
            let totalPriceSum = 0;

            if (container) container.innerHTML = '';

            if (homeCartItems.length === 0) {
                if (container) {
                    container.innerHTML = `<p style="text-align:center; color:#94a3b8; padding-top:60px; font-size:14px;">Your shopping cart is empty.</p>`;
                }
                if (badge) badge.innerText = "0";
                if (subCount) subCount.innerText = "0 Items";
                if (footerTotal) footerTotal.innerText = "₹0";
                return;
            }

            // Loop cards generation with explicit Name, Image & Pricing configurations
            homeCartItems.forEach(item => {
                totalCount += item.qty;
                totalPriceSum += (item.price * item.qty);

                if (container) {
                    const fallbackImg = 'https://dmototech.co.in/wp-content/uploads/2026/01/G-310-GS.webp';
                    const itemImgSrc = item.img ? item.img : fallbackImg;

                    const itemMarkup = `
                <div class="cart-live-item">
                    <img src="${itemImgSrc}" alt="${item.name}" class="cart-live-img">
                    <div class="cart-live-details">
                        <h4 class="cart-live-name">${item.name} <span style="color:#64748b; font-weight:400;">(x${item.qty})</span></h4>
                        <span class="cart-live-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                    <button class="cart-live-remove" onclick="removeHomeCartItem(${item.id})" title="Remove Product">✕</button>
                </div>
            `;
                    container.innerHTML += itemMarkup;
                }
            });

            if (badge) badge.innerText = totalCount;
            if (subCount) subCount.innerText = `${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`;
            if (footerTotal) footerTotal.innerText = `₹${totalPriceSum.toLocaleString('en-IN')}`;
        }

        // === REMOVE ITEM FROM CART ===
        function removeHomeCartItem(productId) {
            homeCartItems = homeCartItems.filter(item => item.id !== productId);
            localStorage.setItem('dochaki_cart', JSON.stringify(homeCartItems));

            forceSyncHomeCart();
            window.dispatchEvent(new Event('storage'));
        }

        // === REDIRECTS TO STANDALONE CHECKOUT MODULE ===
        function triggerRazorpayCheckout() {
            if (homeCartItems.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            // User ko sidhe alag checkout.html page par bhej dega
            window.location.href = "../Checkout/checkout.html";
        }

        // === LOAD AND EXTERNAL EVENT REGISTRATIONS ===
        window.addEventListener('load', forceSyncHomeCart);

        // Listen if storage keys are mutated inside secondary page tabs
        window.addEventListener('storage', function (e) {
            if (!e.key || e.key === 'dochaki_cart') {
                forceSyncHomeCart();
            }
        });


        function toggleMobileNav() {
            const panel = document.getElementById('mobileNavPanel');
            const overlay = document.getElementById('mobileNavOverlay');
            if (panel && overlay) {
                panel.classList.toggle('open');
                overlay.classList.toggle('open');
            }
        }
  

        



        // ================================
// MOBILE NAVIGATION
// ================================

function toggleMobileNav() {

    const panel = document.getElementById("mobileNavPanel");
    const overlay = document.getElementById("mobileNavOverlay");

    panel.classList.add("open");
    overlay.classList.add("open");

    document.body.style.overflow = "hidden";

}

function closeMobileNav() {

    const panel = document.getElementById("mobileNavPanel");
    const overlay = document.getElementById("mobileNavOverlay");

    panel.classList.remove("open");
    overlay.classList.remove("open");

    document.body.style.overflow = "";

}

// ESC Key Support
document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {

        closeMobileNav();

    }

});