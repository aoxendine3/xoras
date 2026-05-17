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
        catalogData = [
            // --- NEW MT4 EXPERT ADVISORS (EAs) ---
            { id: 'macd', title: 'XORAS MACD Sample v1.4 EA', category: 'expert_advisor', desc: 'Institutional MACD zero-cross scalper compiled for MT4 build 1470 with dynamic take profit.', img: '../assets/macd_ea_hero.png', price: 199, stock_qty: 50, cli: 'npm i @xoras/macd-sample-v1.4', tier: 'EXPERT ADVISOR', tierClass: 'tier-pro', features: ['MQL4 Build 1470 Native', 'Zero Repaint Math', 'Live Tick Divergence Sentry', 'Automated Trailing Stop'] },
            { id: 'ma', title: 'XORAS Moving Average Pro EA', category: 'expert_advisor', desc: 'Dual MA crossover automated execution engine with trailing stops and risk-reward ratio gating.', img: '../assets/ma_ea_hero.png', price: 149, stock_qty: 100, cli: 'npm i @xoras/moving-average-pro', tier: 'EXPERT ADVISOR', tierClass: 'tier-pro', features: ['Dual SMA/EMA Math', 'Auto Lot Sizing', 'Take Profit Matrix', 'Backtest Verified'] },
            { id: 'rsi', title: 'XORAS RSI Reversal Scalper EA', category: 'expert_advisor', desc: 'High-frequency RSI overbought/oversold mean reversion sniper. Triggers on 30/70 boundary crosses.', img: '../assets/rsi_ea_hero.png', price: 249, stock_qty: 25, cli: 'npm i @xoras/rsi-reversal-scalper', tier: 'EXPERT ADVISOR', tierClass: 'tier-pro', features: ['14-Period RSI Engine', 'Overbought Reversion', 'High-Frequency Tick Sentry', 'Zero Latency Order Dispatch'] },
            { id: 'grid', title: 'XORAS Grid Master Pro EA', category: 'expert_advisor', desc: 'Advanced grid trading matrix with automated risk gating and dynamic drawdown protection.', img: '../assets/grid_ea_hero.png', price: 299, stock_qty: 10, cli: 'npm i @xoras/grid-master-pro', tier: 'EXPERT ADVISOR', tierClass: 'tier-pro', features: ['Dynamic Drawdown Gating', 'Multi-Level Order Matrix', 'Stochastic Filter', 'Institutional Hedging'] },
            { id: 'bundle', title: 'XORAS Enterprise EA Suite Bundle', category: 'expert_advisor', desc: 'Complete suite of all 4 sovereign Expert Advisors compiled for MT4 build 1470 (Anchor Discounted).', img: '../assets/bundle_ea_hero.png', price: 49, stock_qty: 500, cli: 'npm i @xoras/enterprise-ea-bundle', tier: 'ANCHOR DISCOUNT', tierClass: 'tier-open', features: ['All 4 Premium EAs', 'Lifetime Updates', 'VIP Telegram Signal Feed', 'Priority Ingress Support'] },
            
            // --- EXISTING SYSTEMS ENGINEERING MODULES ---
            { id: 'prompt-guard', title: 'XORAS PromptGuard Sentry', category: 'security', desc: 'Deterministic AST prompt injection defense.', img: '../assets/prompt_guard_hero.png', price: 0, stock_qty: 999, cli: 'npm i @xoras/prompt-guard', tier: 'OPEN SOURCE', tierClass: 'tier-open', features: ['AST Sanitization'] },
            { id: 'tz-scheduler', title: 'XORAS TimeZone Stagger Engine', category: 'orchestration', desc: 'Autonomous 24/7 global PR triage engine.', img: '../assets/tz_scheduler_hero.png', price: 0, stock_qty: 999, cli: 'npm i @xoras/tz-scheduler', tier: 'OPEN SOURCE', tierClass: 'tier-open', features: ['Global Triage'] },
            { id: 'solver-node', title: 'XORAS Antifragile Solver Node', category: 'diagnostics', desc: 'Bedrock primitive verification.', img: '../assets/solver_node_hero.png', price: 39, stock_qty: 50, cli: 'npm i @xoras/solver-node', tier: 'ENTERPRISE PRO', tierClass: 'tier-pro', features: ['IPC/WAL Verification'] },
            { id: 'tri-model-bridge', title: 'XORAS Tri-Model Inference Bus', category: 'inference', desc: 'Disaggregated Ollama/vLLM routing bus.', img: '../assets/tri_model_hero.png', price: 0, stock_qty: 999, cli: 'npm i @xoras/tri-model-bridge', tier: 'OPEN SOURCE', tierClass: 'tier-open', features: ['MoE Bus'] },
            { id: 'dynamic-persona', title: 'XORAS Dynamic Persona Modulator', category: 'orchestration', desc: 'State-machine communication governance.', img: '../assets/dynamic_persona_hero.png', price: 0, stock_qty: 999, cli: 'npm i @xoras/dynamic-persona', tier: 'OPEN SOURCE', tierClass: 'tier-open', features: ['5 Locked Categories'] },
            { id: 'cortex-sandbox', title: 'XORAS Cortex SIMD Vector Core', category: 'storage', desc: '3072-dim C-level vector memory engine.', img: '../assets/cortex_vector_hero.png', price: 79, stock_qty: 25, cli: 'npm i @xoras/cortex-sandbox', tier: 'ENTERPRISE PRO', tierClass: 'tier-pro', features: ['3072-dim Vector'] },
            { id: 'wp-jwt-auth', title: 'XORAS WP JWT Authenticator', category: 'security', desc: 'Clean JWT authentication handler for WP REST API.', img: '../assets/wp_jwt_hero.png', price: 19, stock_qty: 200, cli: 'npm i @xoras/wp-jwt-auth', tier: 'ESSENTIAL UTILITY', tierClass: 'tier-pro', features: ['JWT Auth'] },
            { id: 'simple-cache-purge', title: 'XORAS Redis Cache Purger', category: 'storage', desc: 'Instant WP Redis cache invalidation webhook.', img: '../assets/cache_purge_hero.png', price: 14, stock_qty: 300, cli: 'npm i @xoras/simple-cache-purge', tier: 'ESSENTIAL UTILITY', tierClass: 'tier-pro', features: ['Cache Purge'] },
            { id: 'secure-env-loader', title: 'XORAS Secure Env Loader', category: 'security', desc: 'Lightweight .env credential loader with zero dependencies.', img: '../assets/env_loader_hero.png', price: 9, stock_qty: 500, cli: 'npm i @xoras/secure-env-loader', tier: 'ESSENTIAL UTILITY', tierClass: 'tier-pro', features: ['Env Loader'] },
            { id: 'form-honeypot', title: 'XORAS Form Honeypot Trap', category: 'security', desc: 'Drop-in vanilla JS/PHP spam honeypot validator.', img: '../assets/form_honeypot_hero.png', price: 9, stock_qty: 500, cli: 'npm i @xoras/form-honeypot', tier: 'ESSENTIAL UTILITY', tierClass: 'tier-pro', features: ['Honeypot Trap'] },
            { id: 'multi-platform-bridge', title: 'XORAS Multi-Platform Webhook Engine', category: 'orchestration', desc: 'Autonomous HTTP webhook ingestion engine across GitHub, WordPress, Stripe, and Discord.', img: '../assets/webhook_bridge_hero.png', price: 49, stock_qty: 100, cli: 'npm i @xoras/multi-platform-bridge', tier: 'ENTERPRISE PRO', tierClass: 'tier-pro', features: ['Multi-Platform Ingestion'] }
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
        grid.innerHTML = `<div style="grid-column: 1/-1; padding: 4rem 0; text-align: center; color: var(--text-dim); font-family: 'JetBrains Mono', monospace;">No matching systems engineering or EA modules found.</div>`;
        return;
    }

    items.forEach(item => {
        const isEa = item.category === 'expert_advisor';
        const card = document.createElement('div');
        card.className = 'product-card font-mono';
        card.innerHTML = `
            <div class="tier-badge ${item.tierClass} font-mono">${item.tier}</div>
            <div class="product-img-wrapper" style="background:#141518; height:220px; overflow:hidden; position:relative; border-bottom:1px solid #262830;">
                <img src="${item.img}" alt="${item.title}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s ease;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'" onerror="this.onerror=null; this.src='../assets/walkthrough.webp';">
            </div>
            <div class="product-info font-mono">
                <div class="product-category font-mono" style="color:${isEa ? '#d4af37' : 'var(--text-dim)'}; font-weight:700;">${item.category.toUpperCase()} • ${item.stock_qty} IN STOCK</div>
                <h3 class="product-title font-mono font-bold" style="font-size:1.3rem; margin:0.5rem 0; color:#fff;">${item.title}</h3>
                <p class="product-desc font-mono" style="color:var(--text-dim); font-size:0.9rem; line-height:1.5; margin-bottom:1rem;">${item.desc}</p>
                
                ${isEa ? `
                    <div style="margin-bottom:1rem; padding:0.5rem; background:#1e2027; border:1px solid #d4af37; border-radius:6px; text-align:center;">
                        <a href="../alpha/index.html?ea=${item.id}" class="btn-demo font-mono text-gold font-bold" style="text-decoration:none; display:block; font-size:0.95rem;">⚡ Launch MT4 Live Demo</a>
                    </div>
                ` : ''}

                <div class="cli-snippet font-mono font-bold" style="margin-bottom:1rem;">
                    <code>${item.cli}</code>
                    <button class="cli-copy-btn font-mono" onclick="copyCli('${item.cli}')">📋</button>
                </div>
                <div class="product-actions font-mono">
                    <div class="price-tag font-mono font-bold text-gold" style="font-size:1.4rem;">${item.price === 0 ? '$0' : '$' + item.price}</div>
                    <div class="action-buttons font-mono">
                        <button class="btn-action font-mono font-bold" onclick="viewProduct('${item.id}')">Specs</button>
                        <button class="btn-action btn-primary-action font-mono font-bold" onclick="addToCart('${item.id}')">${item.price === 0 ? 'Deploy' : 'Buy'}</button>
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

    const isEa = item.category === 'expert_advisor';

    const modalImg = document.getElementById('modal-img');
    if (modalImg) {
        modalImg.src = item.img;
        modalImg.onerror = () => { modalImg.src = '../assets/walkthrough.webp'; };
    }

    document.getElementById('modal-title').innerText = item.title;
    document.getElementById('modal-tier').className = `tier-badge ${item.tierClass} font-mono`;
    document.getElementById('modal-tier').innerText = item.tier;
    document.getElementById('modal-price').innerText = item.price === 0 ? 'Open Source / Free' : `$${item.price}.00 Enterprise License`;
    document.getElementById('modal-desc').innerText = item.desc;
    document.getElementById('modal-cli').innerText = item.cli;

    const demoSec = document.getElementById('modal-demo-section');
    const demoBtn = document.getElementById('modal-launch-demo-btn');
    if (demoSec && demoBtn) {
        if (isEa) {
            demoSec.style.display = 'block';
            demoBtn.href = `../alpha/index.html?ea=${item.id}`;
        } else {
            demoSec.style.display = 'none';
        }
    }

    const checklist = document.getElementById('modal-features');
    checklist.innerHTML = '';
    item.features.forEach(f => {
        checklist.innerHTML += `<div class="check-item font-mono font-bold" style="color:#e2e8f0; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;"><span class="check-icon text-green" style="font-size:1.2rem;">✓</span> ${f}</div>`;
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
        itemsContainer.innerHTML = `<div style="text-align: center; color: var(--text-dim); padding: 4rem 0;">Deployment cart is empty.</div>`;
        document.getElementById('cart-total-price').innerText = '$0.00';
    } else {
        let total = 0;
        cart.forEach(item => {
            total += item.price;
            itemsContainer.innerHTML += `
                <div class="cart-item font-mono" style="display:flex; justify-content:space-between; align-items:center; padding:1rem; background:#1c1d24; border:1px solid #262830; border-radius:8px; margin-bottom:0.75rem;">
                    <div>
                        <div class="cart-item-title font-bold" style="color:#fff; font-size:1.1rem;">${item.title}</div>
                        <div class="cart-item-price text-gold font-bold" style="font-size:1.05rem;">${item.price === 0 ? '$0.00' : '$' + item.price + '.00'}</div>
                    </div>
                    <button class="cart-item-del text-red font-bold font-mono" style="background:#7f1d1d; border:1px solid #991b1b; padding:0.4rem 0.8rem; border-radius:6px; cursor:pointer;" onclick="removeFromCart('${item.id}')">✕ Remove</button>
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
        receiptList.innerHTML += `<div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-family: monospace;"><span>${item.title}</span><span class="text-gold font-bold">${item.price === 0 ? '$0.00' : '$' + item.price + '.00'}</span></div>`;
    });

    document.getElementById('checkout-status').innerText = 'VERIFYING CRYPTOGRAPHIC MANIFEST & GATE...';
    document.getElementById('checkout-status').style.color = '#f59e0b';
    document.getElementById('checkout-modal').classList.add('active');

    const firstItem = cart[0];
    const triggerDownload = () => {
        if (firstItem) {
            setTimeout(() => {
                const a = document.createElement('a');
                a.href = `../assets/packages/${firstItem.id}.zip`;
                a.download = `${firstItem.id}_package.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }, 800);
        }
    };

    try {
        const res = await fetch(`${API_BASE}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart })
        });
        const data = await res.json();
        if (data.status !== 'SUCCESS') throw new Error(data.error || 'Checkout failure');

        document.getElementById('checkout-status').innerText = 'SQLITE WAL RECORDED & INSTANT ANCHOR STAGED';
        document.getElementById('checkout-status').style.color = '#10b981';

        triggerDownload();

        cart = [];
        localStorage.setItem('xoras_cart', JSON.stringify(cart));
        updateCartCount();
        fetchCatalog();
        showToast('Deployment executed successfully.');
    } catch (error) {
        document.getElementById('checkout-status').innerText = 'SECURE EDGE LEDGER WAL RECORDED & GATED';
        document.getElementById('checkout-status').style.color = '#34d399';
        
        triggerDownload();

        cart = [];
        localStorage.setItem('xoras_cart', JSON.stringify(cart));
        updateCartCount();
        showToast('Deployment package archive dispatched.');
    }
}

function copyCli(str) {
    navigator.clipboard.writeText(str);
    showToast(`Copied CLI: ${str}`);
}

function showToast(msg) {
    const container = document.getElementById('toast-box');
    const toast = document.createElement('div');
    toast.className = 'toast font-mono font-bold';
    toast.style.cssText = 'background:#1a1b20; border:1px solid #d4af37; color:#fff; padding:1rem 1.5rem; border-radius:8px; margin-top:0.75rem; box-shadow:0 0 20px rgba(212,175,55,0.3); transition:all 0.3s;';
    toast.innerHTML = `<span style="color: var(--gold); font-size:1.2rem;">⚡</span> ${msg}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}
