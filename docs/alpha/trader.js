document.addEventListener('DOMContentLoaded', () => {
    // --- Audio Context for Haptic SFX ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSfx(freq, duration, type = 'sine') {
        if (!audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch(e) {}
    }

    // --- State Variables ---
    let activePair = 'EURUSD';
    let currentBid = 1.08452;
    let currentAsk = 1.08461;
    let eaArmed = false;
    let eaName = 'MACD Sample';
    let balance = 10000.00;
    let totalProfit = 0.00;
    let orders = [];

    // --- Candlestick Chart Data & Canvas Setup ---
    const canvas = document.getElementById('candlestick-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let candles = [];

    function initCandles() {
        candles = [];
        let basePrice = 1.08350;
        const now = Date.now();
        for (let i = 40; i >= 0; i--) {
            const o = basePrice;
            const c = o + (Math.random() - 0.48) * 0.0015;
            const h = Math.max(o, c) + Math.random() * 0.0008;
            const l = Math.min(o, c) - Math.random() * 0.0008;
            candles.push({ time: new Date(now - i * 15 * 60 * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), o, h, l, c });
            basePrice = c;
        }
        currentBid = basePrice;
        currentAsk = currentBid + 0.00009;
        updateDisplayQuotes();
    }
    initCandles();

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawChart();
    }
    window.addEventListener('resize', resizeCanvas);
    if (canvas) resizeCanvas();

    function drawChart() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Grid Lines
        ctx.strokeStyle = '#1e2029';
        ctx.lineWidth = 1;
        const cols = 10;
        const rows = 8;
        for(let i = 0; i < cols; i++) {
            const x = (canvas.width / cols) * i;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for(let j = 0; j < rows; j++) {
            const y = (canvas.height / rows) * j;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }

        if (candles.length === 0) return;

        // Price Min/Max Range
        const prices = candles.flatMap(c => [c.h, c.l]);
        const maxP = Math.max(...prices) + 0.0005;
        const minP = Math.min(...prices) - 0.0005;
        const priceDiff = maxP - minP;

        const chartHeight = canvas.height * 0.75; // Top 75% is Candlestick, bottom 25% is MACD
        const macdTop = canvas.height * 0.78;
        const macdHeight = canvas.height * 0.20;

        // Draw MACD Separator Line
        ctx.strokeStyle = '#262830';
        ctx.beginPath(); ctx.moveTo(0, macdTop - 5); ctx.lineTo(canvas.width, macdTop - 5); ctx.stroke();

        const candleWidth = Math.max(4, Math.floor(canvas.width / (candles.length + 5)));
        const spacing = candleWidth + 4;
        let startX = canvas.width - (candles.length * spacing) - 30;

        let maPoints = [];

        candles.forEach((c, idx) => {
            const x = startX + idx * spacing;
            const yO = ((maxP - c.o) / priceDiff) * chartHeight;
            const yC = ((maxP - c.c) / priceDiff) * chartHeight;
            const yH = ((maxP - c.h) / priceDiff) * chartHeight;
            const yL = ((maxP - c.l) / priceDiff) * chartHeight;

            // Wick
            ctx.strokeStyle = c.c >= c.o ? '#22c55e' : '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x + candleWidth/2, yH); ctx.lineTo(x + candleWidth/2, yL); ctx.stroke();

            // Body
            ctx.fillStyle = c.c >= c.o ? '#22c55e' : '#ef4444';
            ctx.fillRect(x, Math.min(yO, yC), candleWidth, Math.max(2, Math.abs(yO - yC)));

            // Moving Average Point
            if (idx >= 5) {
                const avg = candles.slice(idx-5, idx+1).reduce((acc, curr) => acc + curr.c, 0) / 6;
                const yMa = ((maxP - avg) / priceDiff) * chartHeight;
                maPoints.push({ x: x + candleWidth/2, y: yMa });
            }

            // MACD Histogram Bar Simulation
            const macdVal = (c.c - c.o) * 1000 + (Math.sin(idx * 0.4) * 0.5);
            const yMacdCenter = macdTop + (macdHeight / 2);
            const macdBarHeight = Math.min(macdHeight/2 - 2, Math.abs(macdVal * 8));
            ctx.fillStyle = macdVal >= 0 ? '#34d399' : '#f87171';
            ctx.fillRect(x, macdVal >= 0 ? yMacdCenter - macdBarHeight : yMacdCenter, candleWidth, Math.max(2, macdBarHeight));
        });

        // Draw Moving Average Curve
        if (maPoints.length > 1) {
            ctx.strokeStyle = '#38bdf8'; // Blue MA
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(maPoints[0].x, maPoints[0].y);
            maPoints.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        }

        // Draw Current Bid Horizontal Sentry Line
        const yBid = ((maxP - currentBid) / priceDiff) * chartHeight;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, yBid); ctx.lineTo(canvas.width, yBid); ctx.stroke();
        ctx.setLineDash([]);

        // Price Label on Right Axis
        ctx.fillStyle = '#22c55e';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText(currentBid.toFixed(5), canvas.width - 55, yBid - 5);
    }

    function updateDisplayQuotes() {
        const bidValEl = document.querySelector('.active-sym .bid-val');
        const askValEl = document.querySelector('.active-sym .ask-val');
        const buyQuoteEl = document.getElementById('btn-buy-quote');
        const sellQuoteEl = document.getElementById('btn-sell-quote');
        const ohclEl = document.getElementById('chart-ohcl');

        if (bidValEl) bidValEl.textContent = currentBid.toFixed(5);
        if (askValEl) askValEl.textContent = currentAsk.toFixed(5);
        if (buyQuoteEl) buyQuoteEl.textContent = currentAsk.toFixed(5);
        if (sellQuoteEl) sellQuoteEl.textContent = currentBid.toFixed(5);

        const lastC = candles[candles.length - 1];
        if (ohclEl && lastC) ohclEl.textContent = `O: ${lastC.o.toFixed(5)}  H: ${lastC.h.toFixed(5)}  L: ${lastC.l.toFixed(5)}  C: ${currentBid.toFixed(5)}`;
        
        drawChart();
        updateLedgerBalances();
    }

    // --- Market Tick Simulation Loop ---
    setInterval(() => {
        const delta = (Math.random() - 0.49) * 0.0004;
        currentBid += delta;
        currentAsk = currentBid + 0.00009;

        const lastC = candles[candles.length - 1];
        if (lastC) {
            lastC.c = currentBid;
            lastC.h = Math.max(lastC.h, currentBid);
            lastC.l = Math.min(lastC.l, currentBid);
        }

        updateDisplayQuotes();

        // Check Open Orders Profit Accrual
        orders.forEach(o => {
            const diff = o.type === 'BUY' ? (currentBid - o.openPrice) : (o.openPrice - currentAsk);
            o.profit = diff * o.lot * 100000;
        });
        renderOrdersTable();

        // Automated EA Decision Logic
        if (eaArmed && orders.length < 5 && Math.random() < 0.15) {
            const isBuy = Math.random() > 0.5;
            executeTradeOrder(isBuy ? 'BUY' : 'SELL', 0.10, eaName);
        }
    }, 1200);

    // --- Order Execution Logic ---
    function executeTradeOrder(type, lot, origin = 'Manual') {
        const openPrice = type === 'BUY' ? currentAsk : currentBid;
        const slDiff = type === 'BUY' ? -0.00250 : 0.00250;
        const tpDiff = type === 'BUY' ? 0.00500 : -0.00500;
        
        const newOrder = {
            id: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}),
            type, lot, symbol: activePair, openPrice,
            sl: (openPrice + slDiff).toFixed(5),
            tp: (openPrice + tpDiff).toFixed(5),
            profit: 0.00, origin
        };

        orders.push(newOrder);
        playSfx(type === 'BUY' ? 880 : 440, 0.1, 'triangle');
        showFloatingNotif(`⚡ ${origin} Execution: ${type} ${lot} ${activePair} @ ${openPrice.toFixed(5)}`);
        renderOrdersTable();
    }

    function showFloatingNotif(msg) {
        const notifBox = document.getElementById('trade-notif-box');
        if (!notifBox) return;
        notifBox.textContent = msg;
        notifBox.style.display = 'block';
        setTimeout(() => { notifBox.style.display = 'none'; }, 3000);
    }

    function renderOrdersTable() {
        const tbody = document.getElementById('open-orders-list');
        const countEl = document.getElementById('open-orders-count');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (countEl) countEl.textContent = orders.length;

        let curTotalPl = 0;

        orders.forEach(o => {
            curTotalPl += o.profit;
            const tr = document.createElement('tr'); tr.className = 'font-mono';
            tr.innerHTML = `
                <td>${o.id}</td><td>${o.time}</td>
                <td class="${o.type === 'BUY' ? 'text-blue' : 'text-red'} font-bold">${o.type}</td>
                <td>${o.lot.toFixed(2)}</td><td>${o.symbol}</td><td>${o.openPrice.toFixed(5)}</td>
                <td>${o.sl}</td><td>${o.tp}</td><td>${o.type === 'BUY' ? currentBid.toFixed(5) : currentAsk.toFixed(5)}</td>
                <td class="${o.profit >= 0 ? 'text-green' : 'text-red'} font-bold">${o.profit >= 0 ? '+' : ''}$${o.profit.toFixed(2)}</td>
                <td><button class="btn-close-order" data-id="${o.id}">Close</button></td>
            `;
            tbody.appendChild(tr);
        });

        const totalPlEl = document.getElementById('total-pl');
        if (totalPlEl) {
            totalPlEl.textContent = `${curTotalPl >= 0 ? '+' : ''}$${curTotalPl.toFixed(2)}`;
            totalPlEl.className = curTotalPl >= 0 ? 'text-green font-bold' : 'text-red font-bold';
        }

        document.querySelectorAll('.btn-close-order').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const orderIndex = orders.findIndex(item => item.id === id);
                if (orderIndex !== -1) {
                    balance += orders[orderIndex].profit;
                    orders.splice(orderIndex, 1);
                    playSfx(750, 0.08, 'sine');
                    renderOrdersTable();
                    updateLedgerBalances();
                }
            });
        });
    }

    function updateLedgerBalances() {
        const balEl = document.getElementById('acc-balance');
        const eqEl = document.getElementById('acc-equity');
        const fmEl = document.getElementById('acc-freemargin');
        const curPl = orders.reduce((sum, o) => sum + o.profit, 0);
        const equity = balance + curPl;
        
        if (balEl) balEl.textContent = balance.toFixed(2);
        if (eqEl) eqEl.textContent = equity.toFixed(2);
        if (fmEl) fmEl.textContent = equity.toFixed(2);
    }

    // --- Interactive Toolbars & EA Toggles ---
    const toggleEaBtn = document.getElementById('btn-toggle-ea');
    const eaStatusText = document.getElementById('ea-status-text');
    const eaOverlayBadge = document.getElementById('ea-overlay-badge');
    const eaSmileIcon = document.getElementById('ea-smile-icon');
    const eaSelect = document.getElementById('select-ea-script');

    if (toggleEaBtn) {
        toggleEaBtn.addEventListener('click', () => {
            eaArmed = !eaArmed;
            if (eaArmed) {
                toggleEaBtn.className = 'btn-ea active font-mono';
                if (eaStatusText) eaStatusText.textContent = 'AutoTrading: ON';
                if (eaSmileIcon) eaSmileIcon.textContent = '🙂';
                playSfx(950, 0.15, 'sine');
                showFloatingNotif(`⚡ EA Armed: ${eaName}. Automated MQL4 execution running.`);
            } else {
                toggleEaBtn.className = 'btn-ea inactive font-mono';
                if (eaStatusText) eaStatusText.textContent = 'AutoTrading: OFF';
                if (eaSmileIcon) eaSmileIcon.textContent = '😐';
                playSfx(400, 0.1, 'sine');
                showFloatingNotif(`🚫 EA Disarmed.`);
            }
        });
    }

    if (eaSelect) {
        eaSelect.addEventListener('change', (e) => {
            eaName = e.target.value === 'macd' ? 'MACD Sample' : 'Moving Average';
            const dispEl = document.getElementById('ea-name-disp');
            if (dispEl) dispEl.textContent = eaName;
            playSfx(600, 0.05, 'sine');
            showFloatingNotif(`⚡ Switched EA script to: ${eaName}.ex4`);
        });
    }

    // Manual Trade BUY/SELL Buttons
    const buyBtn = document.getElementById('btn-buy-mkt');
    const sellBtn = document.getElementById('btn-sell-mkt');
    const lotInput = document.getElementById('trade-lot');

    if (buyBtn) { buyBtn.addEventListener('click', () => { executeTradeOrder('BUY', parseFloat(lotInput ? lotInput.value : 0.10)); }); }
    if (sellBtn) { sellBtn.addEventListener('click', () => { executeTradeOrder('SELL', parseFloat(lotInput ? lotInput.value : 0.10)); }); }

    // Symbol & Timeframe Selectors
    document.querySelectorAll('.symbol-table tr[data-pair]').forEach(row => {
        row.addEventListener('click', () => {
            document.querySelectorAll('.symbol-table tr').forEach(r => r.classList.remove('active-sym'));
            row.classList.add('active-sym');
            activePair = row.getAttribute('data-pair');
            document.getElementById('active-chart-pair').textContent = activePair;
            initCandles();
            playSfx(550, 0.05, 'sine');
        });
    });

    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('active-chart-tf').textContent = btn.getAttribute('data-tf');
            initCandles();
            playSfx(650, 0.05, 'sine');
        });
    });

    // Real-time GMT Clock
    const clockEl = document.getElementById('gmt-clock');
    setInterval(() => {
        if (clockEl) clockEl.textContent = new Date().toLocaleTimeString([], {timeZone:'UTC', hour:'2-digit', minute:'2-digit', second:'2-digit'});
    }, 1000);
});
