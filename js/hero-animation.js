/* AxiQuant hero canvas animation — homepage only. Loaded with defer. */
(function() {
    /* ── Theme palette (handles dark = no attribute) ── */
    const THEMES = {
        '':         { p:[59,130,246],  s:[99,220,180],  a:[212,165,116], bg:[10,14,26]   },
        'dark':     { p:[59,130,246],  s:[99,220,180],  a:[212,165,116], bg:[10,14,26]   },
        'light':    { p:[37,99,235],   s:[16,185,129],  a:[245,158,11],  bg:[240,245,255] },
        'ocean':    { p:[6,182,212],   s:[52,211,153],  a:[251,191,36],  bg:[8,47,73]    },
        'warm':     { p:[234,88,12],   s:[245,158,11],  a:[239,68,68],   bg:[67,20,7]    },
        'midnight': { p:[139,92,246],  s:[236,72,153],  a:[99,220,180],  bg:[15,10,40]   },
    };

    function getTheme() {
        const t = document.documentElement.getAttribute('data-theme') || '';
        return THEMES[t] || THEMES[''];
    }

    function rgb(arr, a) {
        return a !== undefined
            ? `rgba(${arr[0]},${arr[1]},${arr[2]},${a})`
            : `rgb(${arr[0]},${arr[1]},${arr[2]})`;
    }

    const canvas = document.getElementById('axiCanvas');
    if (!canvas) return;  // page has no hero canvas
    const ctx    = canvas.getContext('2d');
    let W, H;

    /* ── Resize ── */
    function resize() {
        const rect = canvas.getBoundingClientRect();
        W = canvas.width  = rect.width  || 480;
        H = canvas.height = rect.height || 500;
        initAll();
    }

    /* ════════════════════════════════
       LAYER 1 — Particle field
    ════════════════════════════════ */
    let particles = [];
    function initParticles() {
        particles = [];
        const N = Math.floor(W * H / 5000);
        for (let i = 0; i < N; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 0.8 + Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                phase: Math.random() * Math.PI * 2,
            });
        }
    }

    function drawParticles(c) {
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.phase += 0.015;
            if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
            if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
            const alpha = 0.2 + 0.25 * Math.sin(p.phase);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = rgb(c.p, alpha);
            ctx.fill();
            // Connect nearby particles
            particles.forEach(q => {
                const dx = p.x - q.x, dy = p.y - q.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 80) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = rgb(c.p, 0.04 * (1 - dist/80));
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            });
        });
    }

    /* ════════════════════════════════
       LAYER 2 — Neural network
    ════════════════════════════════ */
    const NN_LAYERS = [3, 5, 5, 3];
    let nnNodes = [], nnPulses = [];

    function initNN() {
        nnNodes = [];
        const cx = W * 0.5, cy = H * 0.5;
        const xSpan = W * 0.55, ySpan = H * 0.55;
        NN_LAYERS.forEach((count, li) => {
            const lx = cx - xSpan/2 + (xSpan / (NN_LAYERS.length - 1)) * li;
            for (let ni = 0; ni < count; ni++) {
                const ly = cy - ySpan/2 + (ySpan / (count - 1 || 1)) * ni;
                nnNodes.push({ x: lx, y: ly, li, ni, phase: Math.random() * Math.PI * 2 });
            }
        });
    }

    function layerNodes(li) { return nnNodes.filter(n => n.li === li); }

    function spawnNNPulse() {
        const li = Math.floor(Math.random() * (NN_LAYERS.length - 1));
        const src = layerNodes(li)[Math.floor(Math.random() * NN_LAYERS[li])];
        const dst = layerNodes(li+1)[Math.floor(Math.random() * NN_LAYERS[li+1])];
        if (src && dst) nnPulses.push({ sx:src.x, sy:src.y, ex:dst.x, ey:dst.y, t:0, spd:0.012+Math.random()*0.008, col: Math.random() > 0.5 ? 'p' : 's' });
    }

    function drawNN(c) {
        // Edges
        for (let li = 0; li < NN_LAYERS.length - 1; li++) {
            layerNodes(li).forEach(src => {
                layerNodes(li+1).forEach(dst => {
                    ctx.beginPath();
                    ctx.moveTo(src.x, src.y);
                    ctx.lineTo(dst.x, dst.y);
                    ctx.strokeStyle = rgb(c.p, 0.08);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                });
            });
        }
        // Pulses
        nnPulses = nnPulses.filter(p => p.t <= 1);
        nnPulses.forEach(p => {
            p.t += p.spd;
            const px = p.sx + (p.ex - p.sx) * p.t;
            const py = p.sy + (p.ey - p.sy) * p.t;
            const alpha = Math.sin(p.t * Math.PI);
            const col = p.col === 'p' ? c.p : c.s;
            // Trail
            const g = ctx.createLinearGradient(p.sx, p.sy, px, py);
            g.addColorStop(0, rgb(col, 0));
            g.addColorStop(1, rgb(col, alpha * 0.8));
            ctx.beginPath(); ctx.moveTo(p.sx, p.sy); ctx.lineTo(px, py);
            ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
            // Dot
            const dg = ctx.createRadialGradient(px, py, 0, px, py, 6);
            dg.addColorStop(0, rgb(col, alpha));
            dg.addColorStop(1, rgb(col, 0));
            ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI*2);
            ctx.fillStyle = dg; ctx.fill();
        });
        // Nodes
        nnNodes.forEach(n => {
            n.phase += 0.018;
            const g = 0.5 + 0.5 * Math.sin(n.phase);
            const col = n.li === 0 || n.li === NN_LAYERS.length-1 ? c.a : c.p;
            // Outer glow ring
            ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI*2);
            ctx.strokeStyle = rgb(col, 0.25 + 0.25*g); ctx.lineWidth = 1; ctx.stroke();
            // Fill
            const ng = ctx.createRadialGradient(n.x-2, n.y-2, 0, n.x, n.y, 8);
            ng.addColorStop(0, rgb(col, 0.9));
            ng.addColorStop(1, rgb(c.bg, 0.9));
            ctx.beginPath(); ctx.arc(n.x, n.y, 7, 0, Math.PI*2);
            ctx.fillStyle = ng; ctx.fill();
        });
    }

    /* ════════════════════════════════
       LAYER 3 — Data chain
    ════════════════════════════════ */
    let chain = [], chainT = 0;

    function initChain() {
        chain = [];
        const n = 5;
        const startX = W * 0.08, endX = W * 0.92;
        const y = H * 0.82;
        for (let i = 0; i < n; i++) {
            chain.push({ x: startX + (endX - startX) / (n-1) * i, y, phase: i * 0.5 });
        }
    }

    function drawChain(c) {
        chainT += 0.012;
        const pulse = (chainT % (chain.length - 1));
        const activeIdx = Math.floor(pulse);
        const subT = pulse - activeIdx;

        // Links
        for (let i = 0; i < chain.length - 1; i++) {
            const a = chain[i], b = chain[i+1];
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = rgb(c.s, 0.25); ctx.lineWidth = 1.5; ctx.stroke();
            // Animated pulse on active link
            if (i === activeIdx) {
                const px = a.x + (b.x - a.x) * subT;
                const py = a.y + (b.y - a.y) * subT;
                const sg = ctx.createRadialGradient(px, py, 0, px, py, 10);
                sg.addColorStop(0, rgb(c.s, 0.9));
                sg.addColorStop(1, rgb(c.s, 0));
                ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI*2);
                ctx.fillStyle = sg; ctx.fill();
            }
        }

        // Blocks
        chain.forEach((bl, i) => {
            bl.phase += 0.02;
            const gy = 2 * Math.sin(bl.phase);
            const bx = bl.x - 18, by = bl.y + gy - 18;
            // Block body
            ctx.beginPath();
            ctx.roundRect(bx, by, 36, 36, 5);
            ctx.fillStyle = rgb(c.bg, 0.85);
            ctx.fill();
            ctx.strokeStyle = rgb(c.s, 0.5);
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Hash lines inside
            for (let h = 0; h < 3; h++) {
                ctx.beginPath();
                ctx.moveTo(bx+6, by+10+h*8);
                ctx.lineTo(bx+30, by+10+h*8);
                ctx.strokeStyle = rgb(c.s, 0.2 + 0.1*h);
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        });
    }

    /* ════════════════════════════════
       LAYER 4 — Data flow bars (top)
    ════════════════════════════════ */
    let bars = [];
    function initBars() {
        bars = [];
        const n = 7;
        for (let i = 0; i < n; i++) {
            bars.push({
                x: W * (0.1 + 0.8 * (i / (n-1))),
                baseH: 20 + Math.random() * 30,
                phase: Math.random() * Math.PI * 2,
                spd: 0.03 + Math.random() * 0.02,
            });
        }
    }

    function drawBars(c) {
        const barW = 14, topY = H * 0.09;
        bars.forEach(b => {
            b.phase += b.spd;
            const h = b.baseH * (0.6 + 0.8 * Math.abs(Math.sin(b.phase)));
            const alpha = 0.4 + 0.4 * Math.abs(Math.sin(b.phase));
            const g = ctx.createLinearGradient(b.x, topY, b.x, topY + h);
            g.addColorStop(0, rgb(c.p, alpha));
            g.addColorStop(1, rgb(c.a, alpha * 0.5));
            ctx.beginPath();
            ctx.roundRect(b.x - barW/2, topY, barW, h, 3);
            ctx.fillStyle = g;
            ctx.fill();
        });
    }

    /* ════════════════════════════════
       LAYER 5 — Centre orb
    ════════════════════════════════ */
    let orbT = 0;
    function drawOrb(c) {
        orbT += 0.012;
        const cx = W/2, cy = H/2;
        const r = 44 + 4 * Math.sin(orbT);

        // Outer pulse rings
        [1.8, 1.5, 1.2].forEach((scale, i) => {
            const alpha = 0.04 + 0.03 * Math.sin(orbT - i * 0.5);
            ctx.beginPath();
            ctx.arc(cx, cy, r * scale, 0, Math.PI*2);
            ctx.strokeStyle = rgb(c.p, alpha);
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Core gradient
        const og = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, 0, cx, cy, r);
        og.addColorStop(0, rgb(c.p, 0.9));
        og.addColorStop(0.6, rgb(c.p, 0.6));
        og.addColorStop(1, rgb(c.bg, 0.9));
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI*2);
        ctx.fillStyle = og;
        ctx.fill();

        // Emoji
        ctx.font = `${Math.round(r * 0.8)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🤖', cx, cy);
    }

    /* ════════════════════════════════
       LAYER 6 — Floating labels
    ════════════════════════════════ */
    const LABELS = [
        { text:'AI/ML',        rx:0.15, ry:0.20 },
        { text:'Data Eng',     rx:0.82, ry:0.18 },
        { text:'Automation',   rx:0.14, ry:0.72 },
        { text:'Gen AI',       rx:0.80, ry:0.70 },
        { text:'Analytics',    rx:0.50, ry:0.12 },
        { text:'Forecasting',  rx:0.50, ry:0.90 },
    ];
    let labelPhases = LABELS.map((_, i) => i * 1.1);

    function drawLabels(c) {
        LABELS.forEach((lbl, i) => {
            labelPhases[i] += 0.012;
            const fy = 5 * Math.sin(labelPhases[i]);
            const lx = lbl.rx * W, ly = lbl.ry * H + fy;

            ctx.font = 'bold 11px system-ui, sans-serif';
            const tw = ctx.measureText(lbl.text).width;
            const pw = tw + 18, ph = 22;

            // Badge bg
            ctx.beginPath();
            ctx.roundRect(lx - pw/2, ly - ph/2, pw, ph, 6);
            ctx.fillStyle = rgb(c.bg, 0.75);
            ctx.fill();
            ctx.strokeStyle = rgb(c.p, 0.4);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            ctx.fillStyle = rgb(c.p, 0.9);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(lbl.text, lx, ly);
        });
    }

    /* ════════════════════════════════
       INIT + MAIN LOOP
    ════════════════════════════════ */
    function initAll() {
        initParticles();
        initNN();
        initChain();
        initBars();
    }

    setInterval(spawnNNPulse, 160);

    function draw() {
        const c = getTheme();
        ctx.clearRect(0, 0, W, H);

        // Subtle bg gradient
        const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
        bg.addColorStop(0, rgb(c.p, 0.06));
        bg.addColorStop(1, rgb(c.bg, 0));
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        drawParticles(c);
        drawBars(c);
        drawNN(c);
        drawChain(c);
        drawOrb(c);
        drawLabels(c);

        requestAnimationFrame(draw);
    }

    // Wait for layout then start
    function start() {
        resize();
        draw();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        setTimeout(start, 50);
    }
    window.addEventListener('resize', resize);

    // Patch main.js applyTheme to trigger canvas repaint (no-op needed, canvas reads live)
    // MutationObserver covers setAttribute; also watch removeAttribute (dark theme)
    new MutationObserver(() => {}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

})();
