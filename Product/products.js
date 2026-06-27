
        const SUPABASE_URL = "https://ycipxljvymewdltlblvn.supabase.co";
        const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljaXB4bGp2eW1ld2RsdGxibHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzA5MzksImV4cCI6MjA5Nzk0NjkzOX0.dleDKMUuavLtA_pPKicnBexgGb4SqOGM7oU7QoEBm9I";
        const dochakiClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Core Cart Storage Engine Array Loop 
        let globalCart = JSON.parse(localStorage.getItem('dochaki_cart')) || [];

        function getSubCategoryIdFromURL() {
            const params = new URLSearchParams(window.location.search);
            return params.get('sub_id');
        }

        async function fetchModelProducts() {
            const subId = getSubCategoryIdFromURL();
            if (!subId) { showErrorState(); return; }

            try {
                const [prodResponse, subCatResponse] = await Promise.all([
                    dochakiClient.from('products').select('*').eq('sub_category_id', subId).order('id', { ascending: true }),
                    dochakiClient.from('sub_categories').select('name').eq('id', subId).single()
                ]);

                if (prodResponse.error) throw prodResponse.error;

                if (subCatResponse.data) {
                    document.getElementById('main-model-title').innerText = `${subCatResponse.data.name} Accessories`;
                }

                renderProductsGrid(prodResponse.data);
                syncCartLogicUI(); // Initial Storage Draw Sync

            } catch (err) {
                console.error(err.message);
                showErrorState();
            }
        }

        function renderProductsGrid(products) {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = '';
            if (!products || products.length === 0) { showErrorState(); return; }

            products.forEach(item => {
                let buttonText = "View Details";
                let buttonClass = "btn-buy";
                let clickAction = `goToDetails(${item.id})`;

                let hasSize = false;
                if (item.bolt_sizes && Array.isArray(item.bolt_sizes)) {
                    if (item.bolt_sizes.length > 0 && !item.bolt_sizes.includes("N/A") && !item.bolt_sizes.includes("n/a")) {
                        hasSize = true;
                    }
                }

                if (!hasSize) {
                    buttonText = "Add to Cart";
                    buttonClass = "btn-direct-cart";
                    clickAction = `directCartTrigger(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.image_url}', event)`;
                }

                const cardHTML = `
                <div class="dochaki-item-card" onclick="goToDetails(${item.id})">
                    <div class="dochaki-media-box">
                        <span class="dochaki-tag">Premium</span>
                        <img src="${item.image_url}" alt="${item.name}" class="dochaki-item-img" onerror="this.src='https://dmototech.co.in/wp-content/uploads/2026/01/G-310-GS.webp'">
                    </div>
                    <div class="dochaki-body-box">
                        <h3 class="dochaki-item-title">${item.name}</h3>
                        <div class="dochaki-price-row">
                            <span class="dochaki-selling-price">₹${item.price.toLocaleString('en-IN')}</span>
                            ${item.cut_price ? `<span class="dochaki-cut-price">₹${item.cut_price.toLocaleString('en-IN')}</span>` : ''}
                        </div>
                        <button class="dochaki-action-btn ${buttonClass}" onclick="${clickAction}">${buttonText}</button>
                    </div>
                </div>
            `;
                grid.innerHTML += cardHTML;
            });

            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('product-count').innerText = `Showing all ${products.length} premium products`;
        }

        function goToDetails(productId) {
            window.location.href = `../Product_detail/Product_deatail.html?id=${productId}`;
        }

        /* LIVE SYNC CART ENGINE LOGIC */
        function toggleCartDrawer() {
            const drawer = document.getElementById('cartDrawer');
            const overlay = document.getElementById('cartOverlay');
            if (drawer && overlay) {
                drawer.classList.toggle('open');
                overlay.classList.toggle('open');
            }
        }

        function directCartTrigger(productId, productName, productPrice, productImg, event) {
            event.stopPropagation();

            // Fresh check on local storage data array
            globalCart = JSON.parse(localStorage.getItem('dochaki_cart')) || [];

            const existingIndex = globalCart.findIndex(item => item.id === productId);
            if (existingIndex > -1) {
                globalCart[existingIndex].qty += 1;
            } else {
                globalCart.push({ id: productId, name: productName, price: productPrice, img: productImg, qty: 1 });
            }

            localStorage.setItem('dochaki_cart', JSON.stringify(globalCart));
            syncCartLogicUI();

            // Broadcast storage change events immediately across browser views
            window.dispatchEvent(new Event('storage'));

            // Auto show the side drawer panel inside window viewport
            const drawer = document.getElementById('cartDrawer');
            const overlay = document.getElementById('cartOverlay');
            if (drawer && overlay) {
                drawer.classList.add('open');
                overlay.classList.add('open');
            }
        }

        function removeLiveCartItem(productId) {
            globalCart = globalCart.filter(item => item.id !== productId);
            localStorage.setItem('dochaki_cart', JSON.stringify(globalCart));
            syncCartLogicUI();

            // Tab communications trigger
            window.dispatchEvent(new Event('storage'));
        }

        function syncCartLogicUI() {
            // Read structure freshly from local storage array state
            globalCart = JSON.parse(localStorage.getItem('dochaki_cart')) || [];

            const container = document.getElementById('cartDrawerContainer');
            const headerCount = document.getElementById('headerCartCount');
            const subCount = document.getElementById('cartDrawerSubCount');
            const footerTotal = document.getElementById('cartDrawerTotal');

            if (container) container.innerHTML = '';
            let totalItems = 0;
            let totalPrice = 0;

            if (globalCart.length === 0) {
                if (container) container.innerHTML = `<p style="text-align:center; color:#a1a1aa; padding-top:40px; font-size:14px;">Your cart bag is empty.</p>`;
                if (headerCount) headerCount.innerText = "0";
                if (subCount) subCount.innerText = "0 Items";
                if (footerTotal) footerTotal.innerText = "₹0";
                return;
            }

            globalCart.forEach(item => {
                totalItems += item.qty;
                totalPrice += (item.price * item.qty);

                if (container) {
                    const fallbackImg = 'https://dmototech.co.in/wp-content/uploads/2026/01/G-310-GS.webp';
                    const itemMarkup = `
                    <div class="cart-live-item">
                        <img src="${item.img || fallbackImg}" alt="${item.name}" class="cart-live-img">
                        <div class="cart-live-details">
                            <h4 class="cart-live-name">${item.name} <span style="color:#64748b; font-weight:400;">(x${item.qty})</span></h4>
                            <span class="cart-live-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                        <button class="cart-live-remove" onclick="removeLiveCartItem(${item.id})">✕</button>
                    </div>
                `;
                    container.innerHTML += itemMarkup;
                }
            });

            if (headerCount) headerCount.innerText = totalItems;
            if (subCount) subCount.innerText = `${totalItems} ${totalItems === 1 ? 'Item' : 'Items'}`;
            if (footerTotal) footerTotal.innerText = `₹${totalPrice.toLocaleString('en-IN')}`;
        }

                // ===============================
        // CHECKOUT PAGE REDIRECT SYSTEM
        // ===============================

        function triggerRazorpayCheckout() {

            // Cart empty check
            if (globalCart.length === 0) {
                alert("Your cart is empty!");
                return;
            }


            // Latest cart save
            localStorage.setItem(
                "dochaki_cart",
                JSON.stringify(globalCart)
            );


            // Close cart drawer
            const drawer = document.getElementById('cartDrawer');
            const overlay = document.getElementById('cartOverlay');

            if (drawer && overlay) {
                drawer.classList.remove('open');
                overlay.classList.remove('open');
            }


            // Redirect checkout page
            window.location.href = "../Checkout/checkout.html";

        }
      
        function showErrorState() {
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('error-state').style.display = 'block';
            document.getElementById('product-count').innerText = `Showing 0 products`;
        }

        // CROSS-TAB REAL-TIME LIVE SYNC LISTENERS
        window.addEventListener('storage', function (e) {
            if (!e.key || e.key === 'dochaki_cart') {
                syncCartLogicUI();
            }
        });

        window.onload = fetchModelProducts;