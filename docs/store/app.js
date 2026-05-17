// docs/store/app.js

const catalogData = [
    {
        id: 'prompt-guard',
        title: 'XORAS PromptGuard Sentry',
        category: 'security',
        desc: 'Deterministic AST prompt injection defense and payload sanitization sentry. Implements mathematical truncation and role-play escape interception.',
        img: '../assets/prompt_guard_hero.png',
        tier: 'OPEN SOURCE / FREE',
        tierClass: 'tier-open',
        price: 0.00,
        cli: 'npm i @xoras/prompt-guard',
        features: ['Zero-latency AST sanitization', 'Block DAN jailbreaks instantly', 'SQLite security audit ledger', 'No heavy dependencies'],
        docs: `const PromptGuard = require('@xoras/prompt-guard');\nconst result = PromptGuard.audit(userInput);\nif (!result.safe) blockExecution();`
    },
    {
        id: 'tz-scheduler',
        title: 'XORAS TimeZone Stagger Engine',
        category: 'orchestration',
        desc: 'Autonomous 24/7 global PR triage and staggered dispatch engine. Dynamically coordinates Asia, Europe, and Americas tranches to prevent maintainer fatigue.',
        img: '../assets/tz_scheduler_hero.png',
        tier: 'OPEN SOURCE / FREE',
        tierClass: 'tier-open',
        price: 0.00,
        cli: 'npm i @xoras/tz-scheduler',
        features: ['Dynamic UTC region mapping', 'Automated stagger delay calculus', 'Asia/Europe/Americas tranches', 'Smart lead prioritization'],
        docs: `const TimeZoneScheduler = require('@xoras/tz-scheduler');\nconst tranche = TimeZoneScheduler.getCurrentActiveRegion();\nconsole.log(tranche.region);`
    },
    {
        id: 'solver-node',
        title: 'XORAS Antifragile Solver Node',
        category: 'diagnostics',
        desc: 'Autonomous system trauma and foundational bedrock verification engine. Probes IPC pipe serialization bottlenecks and SQLite WAL ratios before structural healing.',
        img: '../assets/solver_node_hero.png',
        tier: 'ENTERPRISE PRO',
        tierClass: 'tier-pro',
        price: 49.00,
        cli: 'npm i @xoras/solver-node',
        features: ['Active bedrock verification', 'IPC serialization profiling (<5ms)', 'SQLite WAL ratio validation', 'AST procedural rule compilation'],
        docs: `const solver = require('@xoras/solver-node');\nconst bedrock = await solver.verifyFoundationalBedrock();\nif (bedrock.score < 0.8) healBedrock();`
    },
    {
        id: 'tri-model-bridge',
        title: 'XORAS Tri-Model Inference Bus',
        category: 'inference',
        desc: 'High-speed local Ollama MoE and regional SEA-LION vLLM routing bus. Disaggregates prefill from decode and enforces zero formatting drift across local daemons.',
        img: '../assets/tri_model_hero.png',
        tier: 'OPEN SOURCE / FREE',
        tierClass: 'tier-open',
        price: 0.00,
        cli: 'npm i @xoras/tri-model-bridge',
        features: ['Sub-15ms fast routing', 'Local Ollama & vLLM endpoints', 'Strict minimal prompt locking', 'Dynamic Geo-DNS latency routing'],
        docs: `const bridge = require('@xoras/tri-model-bridge');\nconst expert = await bridge.fastRoute(query, experts);\nconst patch = await bridge.deepReason(task, context);`
    },
    {
        id: 'dynamic-persona',
        title: 'XORAS Dynamic Persona Modulator',
        category: 'orchestration',
        desc: 'State-machine communication governance module locking 5 operational categories. Dynamically injects natural tone constraints without model weight retraining.',
        img: '../assets/dynamic_persona_hero.png',
        tier: 'OPEN SOURCE / FREE',
        tierClass: 'tier-open',
        price: 0.00,
        cli: 'npm i @xoras/dynamic-persona',
        features: ['5 locked operational categories', 'Real-time tone memory memory', 'Zero formatting drift guarantee', 'Natural sentence output generator'],
        docs: `const persona = require('@xoras/dynamic-persona');\nconst context = persona.modulateContext(samplePrompt, baseRole);`
    },
    {
        id: 'cortex-sandbox',
        title: 'XORAS Cortex SIMD Vector Core',
        category: 'storage',
        desc: 'Tri-modal cognitive memory database engine generating verifiable 3072-dimensional vector embeddings with multi-hop relational graph traversal.',
        img: '../assets/cortex_vector_hero.png',
        tier: 'ENTERPRISE PRO',
        tierClass: 'tier-pro',
        price: 99.00,
        cli: 'npm i @xoras/cortex-sandbox',
        features: ['3072-dim SIMD vector indexing', 'SQLite WAL persistent storage', 'Multi-hop relational traversal', 'Temporal memory decay retention'],
        docs: `const { CortexSandbox } = require('@xoras/cortex-sandbox');\nconst sandbox = new CortexSandbox();\nsandbox.ingestLeadMemory(repo, domain, summary);`
    }
];

let cart = JSON.parse(localStorage.getItem('xoras_cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderGrid(catalogData);
    updateCartCount();

    // Filter controls
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            filterTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            filterCatalog();
        });
    });

    // Search box
    const searchInput = document.getElementById('search-catalog');
    searchInput.addEventListener('input', filterCatalog);

    // Modal close events
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    // Cart Drawer Toggle
    document.getElementById('cart-toggle').addEventListener('click', openCartDrawer);
    document.getElementById('checkout-btn').addEventListener('click', initiateCheckout);
});

function filterCatalog() {
    const query = document.getElementById('search-catalog').value.toLowerCase();
    const activeFilter = document.querySelector('.filter-tab.active').dataset.filter;

    const filtered = catalogData.filter(item => {
        const matchCat = activeFilter === 'all' || item.category === activeFilter;
        const matchText = item.title.toLowerCase().includes(query) || item.desc.toLowerCase().includes(query) || item.features.some(f => f.toLowerCase().includes(query));
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
                <div class="product-category">${item.category}</div>
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
    document.getElementById('modal-code').innerText = item.docs;

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

function initiateCheckout() {
    if (cart.length === 0) {
        showToast('Cannot checkout empty cart.');
        return;
    }

    document.getElementById('cart-modal').classList.remove('active');
    
    // Generate simulated checkout receipt
    const receiptList = document.getElementById('checkout-receipt');
    receiptList.innerHTML = '';
    cart.forEach(item => {
        receiptList.innerHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-family: monospace;"><span>${item.title}</span><span>${item.price === 0 ? '$0.00' : '$' + item.price + '.00'}</span></div>`;
    });

    document.getElementById('checkout-modal').classList.add('active');

    // Simulate instant secure download transfer
    setTimeout(() => {
        document.getElementById('checkout-status').innerText = 'SECURE TRANSFER COMPLETE: ZIP ARCHIVE GENERATED';
        document.getElementById('checkout-status').style.color = '#10b981';
        cart = [];
        localStorage.setItem('xoras_cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Deployment package successfully downloaded.');
    }, 2500);
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
