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
    let currentSpread = 9;
    let currentBid = 1.08452;
    let currentAsk = 1.08461;
    let eaArmed = false;
    let eaName = 'MACD Sample v1.4';
    let balance = 10000.00;
    let orders = [];
    let liveWsSocket = null;
    let isLiveWsConnected = false;

    // Indicator Visibility States
    const activeInds = { bb: true, ma: true, macd: true, rsi: true };

    document.querySelectorAll('.ind-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ind = btn.getAttribute('data-ind');
            activeInds[ind] = !activeInds[ind];
            btn.classList.toggle('active', activeInds[ind]);
            drawChart();
            playSfx(activeInds[ind] ? 700 : 400, 0.05, 'sine');
        });
    });

    // --- Candlestick & Indicator Data Setup ---
    const canvas = document.getElementById('candlestick-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let candles = [];

    const basePrices = {
        EURUSD: { p: 1.08350, step: 0.00020, digits: 5, wsSym: '' },
        GBPUSD: { p: 1.26250, step: 0.00025, digits: 5, wsSym: '' },
        USDJPY: { p: 155.650, step: 0.03000, digits: 3, wsSym: '' },
        XAUUSD: { p: 2341.50, step: 0.40000, digits: 2, wsSym: '' },
        BTCUSD: { p: 64150.0, step: 15.0000, digits: 1, wsSym: 'btcusdt@trade' },
        ETHUSD: { p: 3480.00, step: 2.00000, digits: 2, wsSym: 'ethusdt@trade' },
        SOLUSD: { p: 148.20,  step: 0.20000, digits: 2, wsSym: 'solusdt@trade' }
    };

    function initCandles() {
        candles = [];
        const cfg = basePrices[activePair] || { p: 1.0000, step: 0.0005, digits: 4 };
        let baseP = cfg.p;
        const now = Date.now();
        for (let i = 50; i >= 0; i--) {
            const o = baseP;
            const c = o + (Math.random() - 0.48) * cfg.step * 4;
            const h = Math.max(o, c) + Math.random() * cfg.step * 2;
            const l = Math.min(o, c) - Math.random() * cfg.step * 2;
            candles.push({ time: new Date(now - i * 15 * 60 * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), o, h, l, c });
            baseP = c;
        }
        currentBid = baseP;
        currentAsk = currentBid + (currentSpread * Math.pow(10, -cfg.digits));
        updateDisplayQuotes();
        connectLiveWebSocket();
    }

    // --- Live WebSocket Stream Manager ---
    function connectLiveWebSocket() {
        if (liveWsSocket) {
            try { liveWsSocket.close(); } catch(e) {}
            liveWsSocket = null;
        }

        const cfg = basePrices[activePair];
        const badgeEl = document.getElementById('ws-status-badge');
        const badgeTextEl = document.getElementById('ws-status-text');

        if (!cfg || !cfg.wsSym) {
            isLiveWsConnected = false;
            if (badgeEl) {
                badgeEl.style.background = '#451a03';
                badgeEl.style.borderColor = '#78350f';
                badgeEl.querySelector('.ws-dot').style.background = '#f59e0b';
                badgeEl.querySelector('.ws-dot').style.boxShadow = '0 0 10px #f59e0b';
            }
            if (badgeTextEl) badgeTextEl.textContent = '🟠 Simulated Tick Engine (300ms)';
            return;
        }

        try {
            const streamUrl = `wss://stream.binance.com:9443/ws/${cfg.wsSym}`;
            liveWsSocket = new WebSocket(streamUrl);

            liveWsSocket.onopen = () => {
                isLiveWsConnected = true;
                if (badgeEl) {
                    badgeEl.style.background = '#14532d';
                    badgeEl.style.borderColor = '#166534';
                    badgeEl.querySelector('.ws-dot').style.background = '#22c55e';
                    badgeEl.querySelector('.ws-dot').style.boxShadow = '0 0 10px #22c55e';
                }
                if (badgeTextEl) badgeTextEl.textContent = `🟢 Live Stream (Binance WebSocket: ${activePair})`;
                showFloatingNotif(`⚡ Live Market Stream Connected: ${streamUrl}`);
            };

            liveWsSocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data && data.p) {
                    const price = parseFloat(data.p);
                    if (!isNaN(price)) {
                        currentBid = price;
                        currentAsk = currentBid + (currentSpread * Math.pow(10, -cfg.digits));
                        const lastC = candles[candles.length - 1];
                        if (lastC) {
                            lastC.c = currentBid;
                            lastC.h = Math.max(lastC.h, currentBid);
                            lastC.l = Math.min(lastC.l, currentBid);
                        }
                        updateDisplayQuotes();
                        evalProfitAndEa();
                    }
                }
            };

            liveWsSocket.onerror = () => { isLiveWsConnected = false; };
            liveWsSocket.onclose = () => { isLiveWsConnected = false; };
        } catch(e) {
            isLiveWsConnected = false;
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawChart();
    }
    window.addEventListener('resize', resizeCanvas);
    if (canvas) resizeCanvas();

    // --- Advanced Indicator Math ---
    function calcRSI(data, period = 14) {
        if (data.length <= period) return 50;
        let gains = 0, losses = 0;
        for (let i = data.length - period; i < data.length; i++) {
            const diff = data[i].c - data[i-1].c;
            if (diff >= 0) gains += diff; else losses -= diff;
        }
        const rs = (gains / period) / (losses / period || 0.00001);
        return 100 - (100 / (1 + rs));
    }

    function calcSMA(data, idx, period) {
        if (idx < period - 1) return null;
        let sum = 0;
        for (let i = idx - period + 1; i <= idx; i++) sum += data[i].c;
        return sum / period;
    }

    function calcStdDev(data, idx, period, sma) {
        if (idx < period - 1 || sma === null) return 0;
        let sumSq = 0;
        for (let i = idx - period + 1; i <= idx; i++) {
            sumSq += Math.pow(data[i].c - sma, 2);
        }
        return Math.sqrt(sumSq / period);
    }

    // --- Main Chart Rendering ---
    function drawChart() {
        if (!ctx || !canvas || candles.length === 0) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw Chart Grid
        ctx.strokeStyle = '#1a1c23'; ctx.lineWidth = 1;
        const cols = 12, rows = 10;
        for(let i = 0; i < cols; i++) { const x = (canvas.width / cols) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
        for(let j = 0; j < rows; j++) { const y = (canvas.height / rows) * j; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

        const cfg = basePrices[activePair] || { digits: 4 };
        const prices = candles.flatMap(c => [c.h, c.l]);
        const pad = (Math.max(...prices) - Math.min(...prices)) * 0.08 || 0.001;
        const maxP = Math.max(...prices) + pad;
        const minP = Math.min(...prices) - pad;
        const priceDiff = maxP - minP;

        const mainH = canvas.height * 0.70;
        const subTop = canvas.height * 0.73;
        const subH = canvas.height * 0.27;

        // Sub-panel Separator
        ctx.strokeStyle = '#262830'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, subTop - 5); ctx.lineTo(canvas.width, subTop - 5); ctx.stroke();

        const candleWidth = Math.max(5, Math.floor((canvas.width - 70) / (candles.length + 2)));
        const spacing = candleWidth + 4;
        let startX = canvas.width - (candles.length * spacing) - 60;

        let smaPoints = [], emaPoints = [], upperBb = [], lowerBb = [];
        let emaVal = candles[0].c;
        const kEma = 2 / (50 + 1);

        candles.forEach((c, idx) => {
            const x = startX + idx * spacing;
            const yO = ((maxP - c.o) / priceDiff) * mainH;
            const yC = ((maxP - c.c) / priceDiff) * mainH;
            const yH = ((maxP - c.h) / priceDiff) * mainH;
            const yL = ((maxP - c.l) / priceDiff) * mainH;

            // Bollinger Bands Math
            const sma20 = calcSMA(candles, idx, 20);
            if (sma20 !== null) {
                const stdDev = calcStdDev(candles, idx, 20, sma20);
                upperBb.push({ x: x + candleWidth/2, y: ((maxP - (sma20 + stdDev * 2)) / priceDiff) * mainH });
                lowerBb.push({ x: x + candleWidth/2, y: ((maxP - (sma20 - stdDev * 2)) / priceDiff) * mainH });
            }

            // SMA 14
            const sma14 = calcSMA(candles, idx, 14);
            if (sma14 !== null) smaPoints.push({ x: x + candleWidth/2, y: ((maxP - sma14) / priceDiff) * mainH });

            // EMA 50
            emaVal = (c.c - emaVal) * kEma + emaVal;
            if (idx >= 10) emaPoints.push({ x: x + candleWidth/2, y: ((maxP - emaVal) / priceDiff) * mainH });

            // Draw Japanese Candlestick
            const isBull = c.c >= c.o;
            ctx.strokeStyle = isBull ? '#22c55e' : '#ef4444'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x + candleWidth/2, yH); ctx.lineTo(x + candleWidth/2, yL); ctx.stroke();
            ctx.fillStyle = isBull ? '#22c55e' : '#ef4444';
            ctx.fillRect(x, Math.min(yO, yC), candleWidth, Math.max(2, Math.abs(yO - yC)));

            // Draw Sub-Panel (MACD Histogram or RSI)
            if (activeInds.macd) {
                const macdVal = (c.c - c.o) * 500 + (Math.sin(idx * 0.3) * 0.4);
                const yCenter = subTop + (subH / 2);
                const barH = Math.min(subH/2 - 4, Math.abs(macdVal * 12));
                ctx.fillStyle = macdVal >= 0 ? '#34d399' : '#f87171';
                ctx.fillRect(x, macdVal >= 0 ? yCenter - barH : yCenter, candleWidth, Math.max(2, barH));
            }
        });

        // Draw Bollinger Bands Overlay
        if (activeInds.bb && upperBb.length > 1 && lowerBb.length > 1) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.08)'; // Translucent Shaded Blue Band
            ctx.beginPath();
            ctx.moveTo(upperBb[0].x, upperBb[0].y);
            upperBb.forEach(p => ctx.lineTo(p.x, p.y));
            for(let i = lowerBb.length - 1; i >= 0; i--) ctx.lineTo(lowerBb[i].x, lowerBb[i].y);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
            ctx.beginPath(); upperBb.forEach((p, i) => { if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke();
            ctx.beginPath(); lowerBb.forEach((p, i) => { if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw SMA 14 (Cyan) & EMA 50 (Magenta)
        if (activeInds.ma) {
            if (smaPoints.length > 1) {
                ctx.strokeStyle = '#06b6d4'; ctx.lineWidth = 2;
                ctx.beginPath(); smaPoints.forEach((p, i) => { if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke();
            }
            if (emaPoints.length > 1) {
                ctx.strokeStyle = '#d946ef'; ctx.lineWidth = 2;
                ctx.beginPath(); emaPoints.forEach((p, i) => { if(i===0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); }); ctx.stroke();
            }
        }

        // Draw Current Bid Horizontal Sentry Line
        const yBid = ((maxP - currentBid) / priceDiff) * mainH;
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, yBid); ctx.lineTo(canvas.width, yBid); ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#22c55e'; ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText(currentBid.toFixed(cfg.digits), canvas.width - 55, yBid - 4);
    }

    function updateDisplayQuotes() {
        const cfg = basePrices[activePair] || { digits: 4 };
        const activeSymTr = document.querySelector('.active-sym');
        if (activeSymTr) {
            activeSymTr.querySelector('.bid-val').textContent = currentBid.toFixed(cfg.digits);
            activeSymTr.querySelector('.ask-val').textContent = currentAsk.toFixed(cfg.digits);
            activeSymTr.querySelector('.spread-val').textContent = currentSpread;
        }
        
        document.getElementById('btn-buy-quote').textContent = currentAsk.toFixed(cfg.digits);
        document.getElementById('btn-sell-quote').textContent = currentBid.toFixed(cfg.digits);

        const lastC = candles[candles.length - 1];
        if (lastC) {
            document.getElementById('chart-ohcl').textContent = `O: ${lastC.o.toFixed(cfg.digits)}  H: ${lastC.h.toFixed(cfg.digits)}  L: ${lastC.l.toFixed(cfg.digits)}  C: ${currentBid.toFixed(cfg.digits)}`;
        }

        // Update Active EA HUD Telemetry
        const curRsi = calcRSI(candles, 14);
        const hudRsiEl = document.getElementById('hud-rsi-val');
        const hudMacdEl = document.getElementById('hud-macd-val');
        if (hudRsiEl) {
            hudRsiEl.textContent = `${curRsi.toFixed(1)} (${curRsi > 70 ? 'Overbought' : (curRsi < 30 ? 'Oversold' : 'Neutral')})`;
            hudRsiEl.className = curRsi > 70 ? 'text-red font-bold font-mono' : (curRsi < 30 ? 'text-green font-bold font-mono' : 'text-dim font-mono');
        }
        if (hudMacdEl) {
            const mVal = (currentBid - lastC.o);
            hudMacdEl.textContent = `${mVal >= 0 ? '+' : ''}${(mVal*500).toFixed(4)} (${mVal >= 0 ? 'Bullish' : 'Bearish'})`;
            hudMacdEl.className = mVal >= 0 ? 'text-green font-bold font-mono' : 'text-red font-bold font-mono';
        }

        drawChart();
        updateLedgerBalances();
    }

    function evalProfitAndEa() {
        // Check Open Orders Profit Accrual
        orders.forEach(o => {
            const mult = activePair.includes('JPY') ? 1000 : (activePair.includes('BTC') ? 1 : (activePair.includes('XAU') ? 100 : 100000));
            const diff = o.type === 'BUY' ? (currentBid - o.openPrice) : (o.openPrice - currentAsk);
            o.profit = diff * o.lot * mult;
        });
        renderOrdersTable();

        // Automated EA Decision Logic
        if (eaArmed && orders.length < 6 && Math.random() < 0.10) {
            const curRsi = calcRSI(candles, 14);
            if (curRsi < 38) executeTradeOrder('BUY', 0.10, eaName);
            else if (curRsi > 62) executeTradeOrder('SELL', 0.10, eaName);
        }
    }

    // --- Simulated Tick Engine (Active when WebSocket is silent) ---
    setInterval(() => {
        if (isLiveWsConnected) return; // Skip if WebSocket is pushing live trades
        const cfg = basePrices[activePair] || { step: 0.0005, digits: 4 };
        const delta = (Math.random() - 0.49) * cfg.step * 0.4;
        currentBid += delta;
        currentAsk = currentBid + (currentSpread * Math.pow(10, -cfg.digits));

        const lastC = candles[candles.length - 1];
        if (lastC) {
            lastC.c = currentBid;
            lastC.h = Math.max(lastC.h, currentBid);
            lastC.l = Math.min(lastC.l, currentBid);
        }

        updateDisplayQuotes();
        evalProfitAndEa();
    }, 300);

    // --- Query Parameter EA Arming from Storefront ---
    function checkUrlEaArming() {
        const urlParams = new URLSearchParams(window.location.search);
        const eaParam = urlParams.get('ea');
        const eaSelect = document.getElementById('select-ea-script');
        const toggleBtn = document.getElementById('btn-toggle-ea');
        
        if (eaParam && eaSelect && toggleBtn) {
            const optionsMap = { macd: 'macd', ma: 'ma', rsi: 'rsi', grid: 'grid', bundle: 'bundle' };
            if (optionsMap[eaParam]) {
                eaSelect.value = optionsMap[eaParam];
                eaName = eaSelect.options[eaSelect.selectedIndex].text;
                document.getElementById('ea-hud-title').textContent = eaName.split('(')[0].trim();
                document.getElementById('tree-active-ea').textContent = `⚡ ${eaName.split('(')[0].trim()} [Armed]`;
                
                // Arm EA
                eaArmed = true;
                toggleBtn.className = 'btn-ea active font-mono';
                document.getElementById('ea-status-text').textContent = 'AutoTrading: ON';
                document.getElementById('ea-hud-panel').style.display = 'block';
                showFloatingNotif(`⚡ Sovereign Storefront Ingress: Armed ${eaName}`);
            }
        }
    }
    initCandles();
    checkUrlEaArming();

    // --- Order Execution & Table Ledger ---
    function executeTradeOrder(type, lot, origin = 'Manual') {
        const cfg = basePrices[activePair] || { digits: 4 };
        const openPrice = type === 'BUY' ? currentAsk : currentBid;
        const slDiff = (type === 'BUY' ? -0.00300 : 0.00300) * (cfg.p > 100 ? 100 : 1);
        const tpDiff = (type === 'BUY' ? 0.00600 : -0.00600) * (cfg.p > 100 ? 100 : 1);
        
        const newOrder = {
            id: `#${Math.floor(10000000 + Math.random() * 90000000)}`,
            time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'}),
            type, lot, symbol: activePair, openPrice, digits: cfg.digits,
            sl: (openPrice + slDiff).toFixed(cfg.digits),
            tp: (openPrice + tpDiff).toFixed(cfg.digits),
            commission: 0.00, swap: 0.00, profit: 0.00, origin
        };

        orders.push(newOrder);
        playSfx(type === 'BUY' ? 880 : 440, 0.1, 'triangle');
        showFloatingNotif(`⚡ ${origin}: Executed ${type} ${lot} ${activePair} @ ${openPrice.toFixed(cfg.digits)}`);
        renderOrdersTable();
    }

    function showFloatingNotif(msg) {
        const notifBox = document.getElementById('trade-notif-box');
        if (!notifBox) return;
        notifBox.textContent = msg;
        notifBox.style.display = 'block';
        setTimeout(() => { notifBox.style.display = 'none'; }, 2800);
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
            const curP = o.type === 'BUY' ? currentBid : currentAsk;
            const tr = document.createElement('tr'); tr.className = 'font-mono';
            tr.innerHTML = `
                <td>${o.id}</td><td>${o.time}</td>
                <td class="${o.type === 'BUY' ? 'text-blue' : 'text-red'} font-bold">${o.type}</td>
                <td>${o.lot.toFixed(2)}</td><td class="font-bold text-gold">${o.symbol}</td>
                <td>${o.openPrice.toFixed(o.digits)}</td><td>${o.sl}</td><td>${o.tp}</td>
                <td>${curP.toFixed(o.digits)}</td><td>$0.00</td><td>$0.00</td>
                <td class="${o.profit >= 0 ? 'text-green' : 'text-red'} font-bold font-mono">${o.profit >= 0 ? '+' : ''}$${o.profit.toFixed(2)}</td>
                <td><button class="btn-close-order" data-id="${o.id}">Close X</button></td>
            `;
            tbody.appendChild(tr);
        });

        const totalPlEl = document.getElementById('total-pl');
        if (totalPlEl) {
            totalPlEl.textContent = `${curTotalPl >= 0 ? '+' : ''}$${curTotalPl.toFixed(2)}`;
            totalPlEl.className = curTotalPl >= 0 ? 'text-green font-bold font-mono' : 'text-red font-bold font-mono';
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

    // --- Interactive Toolbars & EA HUD Panel ---
    const toggleEaBtn = document.getElementById('btn-toggle-ea');
    const eaStatusText = document.getElementById('ea-status-text');
    const eaHudPanel = document.getElementById('ea-hud-panel');
    const eaSelect = document.getElementById('select-ea-script');
    const closeAllBtn = document.getElementById('btn-close-all-profit');

    if (toggleEaBtn) {
        toggleEaBtn.addEventListener('click', () => {
            eaArmed = !eaArmed;
            if (eaArmed) {
                toggleEaBtn.className = 'btn-ea active font-mono';
                if (eaStatusText) eaStatusText.textContent = 'AutoTrading: ON';
                if (eaHudPanel) eaHudPanel.style.display = 'block';
                playSfx(950, 0.15, 'sine');
                showFloatingNotif(`⚡ EA Armed: ${eaName}. Automated execution active.`);
            } else {
                toggleEaBtn.className = 'btn-ea inactive font-mono';
                if (eaStatusText) eaStatusText.textContent = 'AutoTrading: OFF';
                if (eaHudPanel) eaHudPanel.style.display = 'none';
                playSfx(400, 0.1, 'sine');
                showFloatingNotif(`🚫 EA Disarmed.`);
            }
        });
    }

    if (eaSelect) {
        eaSelect.addEventListener('change', (e) => {
            eaName = e.target.options[e.target.selectedIndex].text;
            const hudTitleEl = document.getElementById('ea-hud-title');
            if (hudTitleEl) hudTitleEl.textContent = eaName.split('(')[0].trim();
            document.getElementById('tree-active-ea').textContent = `⚡ ${eaName.split('(')[0].trim()} [Armed]`;
            playSfx(600, 0.05, 'sine');
            showFloatingNotif(`⚡ Armed EA Script: ${eaName}`);
        });
    }

    if (closeAllBtn) {
        closeAllBtn.addEventListener('click', () => {
            let realized = 0;
            orders = orders.filter(o => {
                if (o.profit > 0) { realized += o.profit; return false; }
                return true;
            });
            if (realized > 0) {
                balance += realized;
                playSfx(1050, 0.2, 'sine');
                showFloatingNotif(`✅ Realized +$${realized.toFixed(2)} from profitable orders.`);
                renderOrdersTable();
                updateLedgerBalances();
            }
        });
    }

    // Manual Trade BUY/SELL Buttons
    const buyBtn = document.getElementById('btn-buy-mkt');
    const sellBtn = document.getElementById('btn-sell-mkt');
    const lotInput = document.getElementById('trade-lot');

    if (buyBtn) buyBtn.addEventListener('click', () => executeTradeOrder('BUY', parseFloat(lotInput ? lotInput.value : 0.10)));
    if (sellBtn) sellBtn.addEventListener('click', () => executeTradeOrder('SELL', parseFloat(lotInput ? lotInput.value : 0.10)));

    // Symbol & Timeframe Selectors
    document.querySelectorAll('.symbol-table tr[data-pair]').forEach(row => {
        row.addEventListener('click', () => {
            document.querySelectorAll('.symbol-table tr').forEach(r => r.classList.remove('active-sym'));
            row.classList.add('active-sym');
            activePair = row.getAttribute('data-pair');
            currentSpread = parseInt(row.getAttribute('data-spread') || 10);
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
