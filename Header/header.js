    // ================================
    // MOBILE NAVIGATION
    // ================================

    function toggleMobileNav() {

        const panel = document.getElementById("mobileNavPanel");
        const overlay = document.getElementById("mobileNavOverlay");

        if (!panel || !overlay) return;

        panel.classList.add("open");
        overlay.classList.add("open");

        document.body.style.overflow = "hidden";

    }

    function closeMobileNav() {

        const panel = document.getElementById("mobileNavPanel");
        const overlay = document.getElementById("mobileNavOverlay");

        if (!panel || !overlay) return;

        panel.classList.remove("open");
        overlay.classList.remove("open");

        document.body.style.overflow = "";

    }

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeMobileNav();

        }

    }); 




// =======================================
// SUPABASE
// =======================================

const SUPABASE_URL = 'https://ycipxljvymewdltlblvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljaXB4bGp2eW1ld2RsdGxibHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzA5MzksImV4cCI6MjA5Nzk0NjkzOX0.dleDKMUuavLtA_pPKicnBexgGb4SqOGM7oU7QoEBm9I';


const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    }
);

async function initSupabase() {

    while (!document.getElementById("auth-buttons-group")) {

        await new Promise(resolve => setTimeout(resolve,50));

    }

    const { data } =
    await supabaseClient.auth.getSession();

    updateAuthUI(data.session);

    supabaseClient.auth.onAuthStateChange(
        (event, session)=>{

            console.log("AUTH EVENT :",event);

            updateAuthUI(session);

        }
    );

}


let currentSession = null;

function isHomePage() {
    const path = window.location.pathname.replace(/\/+$/, "");
    const fileName = path.split("/").pop().toLowerCase();
    return !fileName || fileName === "index.html";
}

function isMobileView() {
    return window.matchMedia("(max-width: 768px)").matches;
}

function getProjectPath(relativePath) {
    const path = window.location.pathname.replace(/\\/g, "/");
    const segments = path.split("/").filter(Boolean);

    if (segments.length <= 1) {
        return `./${relativePath}`;
    }

    const depth = "../".repeat(segments.length - 1);
    return `${depth}${relativePath}`;
}

function updateAuthUI(session) {

    currentSession = session;

    const authGroup = document.getElementById("auth-buttons-group");
    const mobileAuthContainer = document.getElementById("mobileAuthContainer");
    const headerCartIcon = document.getElementById("headerCartIcon");

    const isLoggedIn = Boolean(session && session.user);
    const isMobile = isMobileView();
    const showLogout = isLoggedIn && isHomePage();
    const loginHref = getProjectPath("My_Account_page/login.html");
    const signupHref = getProjectPath("My_Account_page/signup.html");
    const accountHref = getProjectPath("My_Account_page/My_account.html");

    if (authGroup) {
        if (!isMobile) {
            if (isLoggedIn) {
                authGroup.innerHTML = `
                    <a href="${accountHref}"
                       class="btn-login"
                       style="margin-right:10px;">
                        My Account
                    </a>

                    ${showLogout ? `
                        <button
                            id="logoutBtn"
                            class="header-logout-btn">
                            Logout
                        </button>
                    ` : ""}
                `;

                const logoutBtn = document.getElementById("logoutBtn");
                if (logoutBtn) {
                    logoutBtn.addEventListener("click", logout);
                }
            } else {
                authGroup.innerHTML = `
                    <a href="${loginHref}"
                       class="btn-login"
                       style="margin-right:10px;">
                       Login
                    </a>

                    <a href="${signupHref}"
                       class="btn-signup">
                       Signup
                    </a>
                `;
            }
        } else {
            authGroup.innerHTML = "";
        }
    }

    if (mobileAuthContainer) {

        if (isLoggedIn) {
            mobileAuthContainer.innerHTML = `
                <a href="${accountHref}" class="btn-account-mob">My Account</a>
                ${showLogout ? `<button id="mobileLogoutBtn" class="btn-login-mob" style="background:#ef4444;">Logout</button>` : ""}
            `;

            const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");
            if (mobileLogoutBtn) {
                mobileLogoutBtn.addEventListener("click", logout);
            }
        } else {
            mobileAuthContainer.innerHTML = `
                <a href="${loginHref}" class="btn-login-mob">Login</a>
            `;
        }

    }

    if (headerCartIcon) {
        headerCartIcon.classList.toggle("hide-cart", !isLoggedIn);
    }

}

async function logout() {

    try {

        const { error } =
        await supabaseClient.auth.signOut();

        if (error) {

            console.error(error);

            return;

        }


        window.location.href = getProjectPath("index.html");

    }

    catch(err){

        console.error(err);

    }

}


// ========================================
// INITIALIZE HEADER AUTH
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    while (!window.supabase) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    while (!document.getElementById("auth-buttons-group")) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    initSupabase();

});

window.addEventListener("resize", () => {
    updateAuthUI(currentSession);
});




// Cart wala Option 


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
                const itemPrice = Number(String(item.price).replace(/[^0-9.-]+/g, '')) || 0;
                const itemQty = parseInt(item.qty, 10) || 0;
                totalCount += itemQty;
                totalPriceSum += (itemPrice * itemQty);

                if (container) {
                    const fallbackImg = 'https://dmototech.co.in/wp-content/uploads/2026/01/G-310-GS.webp';
                    const itemImgSrc = item.img ? item.img : fallbackImg;

                    const itemMarkup = `
                <div class="cart-live-item">
                    <img src="${itemImgSrc}" alt="${item.name}" class="cart-live-img">
                    <div class="cart-live-details">
                        <h4 class="cart-live-name">${item.name} <span style="color:#64748b; font-weight:400;">(x${itemQty})</span></h4>
                        <span class="cart-live-price">₹${(itemPrice * itemQty).toLocaleString('en-IN')}</span>
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
        window.addEventListener('DOMContentLoaded', forceSyncHomeCart);

        // Listen if storage keys are mutated inside secondary page tabs
        window.addEventListener('storage', function (e) {
            if (!e.key || e.key === 'dochaki_cart') {
                forceSyncHomeCart();
            }
        });

  

    



