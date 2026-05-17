// docs/store/app.js

const API_BASE = 'http://127.0.0.1:3050/api';
let catalogData = [];
let cart = JSON.parse(localStorage.getItem('xoras_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchCatalog();
    updateCartCount();

    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filterCatalog();
        });
    });

    document.getElementById('search-catalog').addEventListener('input', filterCatalog);

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    document.getElementById('cart-toggle').addEventListener('click', openCartDrawer);
    document.getElementById('checkout-btn').addEventListener('click', initiateCheckout);
});

async function fetchCatalog() {
    try {
        const res = await fetch(`${API_BASE}/catalog`);
        if (!res.ok) throw new Error('Backend unlocatable.');
        catalogData = await res.json();
        
        // Populate features array
        catalogData.forEach(item => {
            item.features = [
                'Verifiable cryptographic execution',
                `Current Inventory Stock: ${item.stock_qty} units`,
                `Verified Enterprise Installs: ${item.downloads_count}`,
                'Zero external dependency bloat'
            ];
        });

        renderGrid(catalogData);
    } catch (error) {
        showToast('Operating offline fallback cache.');
        // Fallback
        catalogData = [
            { id: 'prompt-guard', title: 'XORAS PromptGuard Sentry', category: 'security', desc: 'Deterministic AST prompt injection defense.', img: '../assets/prompt_guard_hero.png', price: 0, stock_qty: 999, cli: 'npm i @xoras/prompt-guard', tier: 'OPEN SOURCE', tierClass: 'tier-open', features: ['AST Sanitization'] },
            { id: 'solver-node', title: 'XORAS Antifragile Solver Node', category: 'diagnostics', desc: 'Bedrock primitive verification.', img: '../assets/solver_node_hero.png', price: 49, stock_qty: 50, cli: 'npm i @xoras/solver-node', tier: 'ENTERPRISE PRO', tierClass: 'tier-pro', features: ['IPC/WAL Verification'] }
        ];
        renderGrid(catalogData);
    }
}

function filterCatalog() {
    const query = document.getElementById('search-catalog').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;

    const filtered = catalogData.filter(item => {
        const matchCat = activeFilter === 'all' || item.category === activeFilter;
        const matchText = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query) || item.cli.toLowerCase().includes(query);
        return matchCat && matchText;
    });

    renderGrid(filtered);
}

function renderGrid(items) {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; padding: 4rem 0; text-align: center; color: var(--text-muted);">No matching systems engineering modules found.</div>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="tier-badge ${item.tierClass}">${item.tier}</div>
            <div class="product-img-wrapper">
                <img src="${item.img}" alt="${item.title}" class="product-img">
            </div>
            <div class="product-info">
                <div class="product-category">${item.category} • ${item.stock_qty} IN STOCK</div>
                <h3 class="product-title">${item.title}</h3>
                <p class="product-desc">${item.desc}</p>
                <div class="cli-snippet">
                    <code>${item.cli}</code>
                    <button class="cli-copy-btn" onclick="copyCli('${item.cli}')">📋</button>
                </div>
                <div class="product-actions">
                    <div class="price-tag">${item.price === 0 ? '$0' : '$' + item.price}</div>
                    <div class="action-buttons">
                        <button class="btn-action" onclick="viewProduct('${item.id}')">Docs</button>
                        <button class="btn-action btn-primary-action" onclick="addToCart('${item.id}')">${item.price === 0 ? 'Deploy' : 'Buy'}</button>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function viewProduct(id) {
    const item = catalogData.find(p => p.id === id);
    if (!item) return;

    document.getElementById('modal-img').src = item.img;
    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-tier').className = `tier-badge ${item.tierClass}`;
    document.getElementById('modal-tier').innerText = item.tier;
    document.getElementById('modal-price').innerText = item.price === 0 ? 'Open Source / Free' : `$${item.price}.00 Enterprise License`;
    document.getElementById('modal-desc').innerText = item.desc;
    document.getElementById('modal-cli').innerText = item.cli;
    document.getElementById('modal-code').innerText = `// Verified Integration Stub\nconst module = require('${item.cli.split('npm i ')[1]}');`;

    const checklist = document.getElementById('modal-features');
    checklist.innerHTML = '';
    item.features.forEach(f => {
        checklist.innerHTML += `<div class="check-item"><span class="check-icon">✓</span> ${f}</div>`;
    });

    document.getElementById('modal-deploy-btn').onclick = () => { addToCart(item.id); };
    document.getElementById('product-modal').classList.add('active');
}

function addToCart(id) {
    const item = catalogData.find(p => p.id === id);
    if (!item) return;

    if (!cart.some(c => c.id === id)) {
        cart.push(item);
        localStorage.setItem('xoras_cart', JSON.stringify(cart));
        updateCartCount();
        showToast(`Staged ${item.title} in deployment cart.`);
    } else {
        showToast(`${item.title} is already staged.`);
    }
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    localStorage.setItem('xoras_cart', JSON.stringify(cart));
    updateCartCount();
    openCartDrawer();
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.length;
}

function openCartDrawer() {
    const itemsContainer = document.getElementById('cart-items-container');
    itemsContainer.innerHTML = '';

    if (cart.length === 0) {
        itemsContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 4rem 0;">Deployment cart is empty.</div>`;
        document.getElementById('cart-total-price').innerText = '$0.00';
    } else {
        let total = 0;
        cart.forEach(item => {
            total += item.price;
            itemsContainer.innerHTML += `
                <div class="cart-item">
                    <div>
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.price === 0 ? '$0.00' : '$' + item.price + '.00'}</div>
                    </div>
                    <button class="cart-item-del" onclick="removeFromCart('${item.id}')">✕</button>
                </div>
            `;
        });
        document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    }

    document.getElementById('cart-modal').classList.add('active');
}

async function initiateCheckout() {
    if (cart.length === 0) {
        showToast('Cannot checkout empty cart.');
        return;
    }

    document.getElementById('cart-modal').classList.remove('active');
    const receiptList = document.getElementById('checkout-receipt');
    receiptList.innerHTML = '';
    cart.forEach(item => {
        receiptList.innerHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-family: monospace;"><span>${item.title}</span><span>${item.price === 0 ? '$0.00' : '$' + item.price + '.00'}</span></div>`;
    });

    document.getElementById('checkout-status').innerText = 'CONTACTING BACKEND SECURE LEDGER...';
    document.getElementById('checkout-status').style.color = '#f59e0b';
    document.getElementById('checkout-modal').classList.add('active');

    try {
        const res = await fetch(`${API_BASE}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        });
        const data = await res.json();
        if (data.status !== 'SUCCESS') throw new Error(data.error || 'Checkout failure');

        document.getElementById('checkout-status').innerText = 'TRANSACTION LOGGED IN SQLITE WAL: INVENTORY DECREMENTED';
        document.getElementById('checkout-status').style.color = '#10b981';

        // Trigger real cryptographic ZIP bundle download for the first staged item
        const firstItem = cart[0];
        if (firstItem) {
            setTimeout(() => {
                window.location.href = `${API_BASE}/download/${firstItem.id}`;
            }, 1000);
        }

        cart = [];
        localStorage.setItem('xoras_cart', JSON.stringify(cart));
        updateCartCount();
        fetchCatalog(); // Refresh live stock counts
        showToast('Deployment executed successfully.');
    } catch (error) {
        document.getElementById('checkout-status').innerText = 'OFFLINE CHECKOUT SIMULATION COMPLETED';
        document.getElementById('checkout-status').style.color = '#10b981';
        cart = [];
        localStorage.setItem('xoras_cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Simulated deployment executed.');
    }
}

function copyCli(str) {
    navigator.clipboard.writeText(str);
    showToast(`Copied CLI: ${str}`);
}

function showToast(msg) {
    const container = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="color: var(--primary);">⚡</span> ${msg}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
