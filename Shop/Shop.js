        const SHOP_SUPABASE_URL = "https://ycipxljvymewdltlblvn.supabase.co";
        const SHOP_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljaXB4bGp2eW1ld2RsdGxibHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzNzA5MzksImV4cCI6MjA5Nzk0NjkzOX0.dleDKMUuavLtA_pPKicnBexgGb4SqOGM7oU7QoEBm9I";

        const dochakiClient = window.supabase.createClient(SHOP_SUPABASE_URL, SHOP_SUPABASE_ANON_KEY);

        let currentViewState = 'brands';
        let cachedCategoriesData = [];
        let activeCategoryId = null;
        let activeCategoryName = "";

        // 1. Load main brands
        async function loadDochakiBrands() {
            showLoader(true);
            currentViewState = 'brands';
            document.getElementById('main-shop-title').innerText = "Premium Biking Gear";

            try {
                const { data, error } = await dochakiClient
                    .from('categories')
                    .select('id, name, slug, image_url')
                    .order('id', { ascending: true });

                if (error) throw error;

                cachedCategoriesData = data;
                renderTabsBar(data, 'brands');
                renderGridUI(data, 'brands');

            } catch (err) {
                console.error("Supabase Error:", err.message);
                document.getElementById('loading-state').innerText = "Failed to sync dashboard database data.";
            } finally {
                showLoader(false);
            }
        }

        // 2. Fetch Sub-categories
        async function loadSubCategories(categoryId, categoryName) {
            showLoader(true);
            currentViewState = 'subcategories';
            activeCategoryId = categoryId;
            activeCategoryName = categoryName;
            document.getElementById('main-shop-title').innerText = categoryName;

            try {
                const { data, error } = await dochakiClient
                    .from('sub_categories')
                    .select('id, name, slug, image_url')
                    .eq('category_id', categoryId)
                    .order('id', { ascending: true });

                if (error) throw error;

                renderTabsBar(data, 'subcategories');
                renderGridUI(data, 'subcategories');

            } catch (err) {
                console.error("Error loading subcategories:", err.message);
            } finally {
                showLoader(false);
            }
        }

        // 4. Dynamic Slider Bar Tabs Generator Engine
        function renderTabsBar(items, context) {
            const container = document.getElementById('category-tabs-container');
            container.innerHTML = '';

            if (context === 'brands') {
                const allButton = document.createElement('button');
                allButton.className = 'category-tab active';
                allButton.innerText = 'All Brands';
                allButton.onclick = function (e) { filterFrontendItems('all', e); };
                container.appendChild(allButton);

                items.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'category-tab';
                    button.innerText = item.name;
                    button.onclick = function (e) { filterFrontendItems(item.slug, e); };
                    container.appendChild(button);
                });
            } else if (context === 'subcategories') {
                const backButton = document.createElement('button');
                backButton.className = 'category-tab back-tab';
                backButton.innerText = '⬅️ Back to Brands';
                backButton.onclick = function () { loadDochakiBrands(); };
                container.appendChild(backButton);

                const allSubButton = document.createElement('button');
                allSubButton.className = 'category-tab active';
                allSubButton.innerText = 'All Sub-Categories';
                allSubButton.onclick = function (e) { filterFrontendItems('all', e); };
                container.appendChild(allSubButton);

                items.forEach(item => {
                    const button = document.createElement('button');
                    button.className = 'category-tab';
                    button.innerText = item.name;
                    button.onclick = function (e) { filterFrontendItems(item.slug, e); };
                    container.appendChild(button);
                });
            }
        }

        // 5. Matrix UI Grid Renderer Core
        function renderGridUI(items, context) {
            const grid = document.getElementById('product-grid');
            grid.innerHTML = '';

            if (!items || items.length === 0) {
                grid.innerHTML = `<p style="grid-column: span 2; text-align: center; color: #757575; padding: 40px;">No items found in this section yet.</p>`;
                document.getElementById('product-count').innerText = `Showing 0 items`;
                return;
            }

            items.forEach(item => {
                let targetAction = "";

                if (context === 'brands') {
                    targetAction = `loadSubCategories(${item.id}, '${item.name.replace(/'/g, "\\'")}')`;
                } else if (context === 'subcategories') {
                    targetAction = `window.location.href = '../Product/products.html?sub_id=${item.id}'`;
                }

                const cardHTML = `
                    <div class="dochaki-item-card" data-category="${item.slug}" onclick="${targetAction}">
                        <div class="dochaki-media-box">
                            <span class="dochaki-tag">${item.name}</span>
                            <img src="${item.image_url}" alt="${item.name}" class="dochaki-item-img" onerror="this.src='https://dmototech.co.in/wp-content/uploads/2026/01/G-310-GS.webp'">
                        </div>
                        <div class="dochaki-body-box">
                            <h3 class="dochaki-item-title">${item.name}</h3>
                        </div>
                    </div>
                `;
                grid.innerHTML += cardHTML;
            });

            document.getElementById('product-count').innerText = `Showing all ${items.length} premium ${context}`;
        }

        // 6. Instant Filter Action for Tabs
        function filterFrontendItems(slug, event) {
            const tabs = document.querySelectorAll('.category-tab');
            tabs.forEach(tab => tab.classList.remove('active'));

            if (event && event.currentTarget) {
                event.currentTarget.classList.add('active');
            }

            const cards = document.querySelectorAll('.dochaki-item-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const itemSlug = card.getAttribute('data-category');
                if (slug === 'all' || itemSlug === slug) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            document.getElementById('product-count').innerText = `Showing ${visibleCount} matches`;
        }

        function showLoader(displayState) {
            document.getElementById('loading-state').style.display = displayState ? 'block' : 'none';
        }

        window.onload = loadDochakiBrands;
  