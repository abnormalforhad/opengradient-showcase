// ============================================
//  OPENGRADIENT SHOWCASE — Ghibli White Edition
// ============================================

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ---- Mobile menu ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ============================================
//  GHIBLI PARTICLE CANVAS
//  Floating soot-sprite like orbs + dandelion
//  seeds that drift gently upward
// ============================================
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let W, H, mouse = { x: -1000, y: -1000 };

    // Ghibli-inspired warm pastel colours
    const COLORS = [
        { r: 107, g: 158, b: 120 },  // forest green (kodama)
        { r: 232, g: 164, b: 90 },  // warm amber (firefly)
        { r: 196, g: 119, b: 162 },  // sakura pink
        { r: 94, g: 144, b: 190 },  // sky blue (wind)
        { r: 220, g: 200, b: 140 },  // warm cream/dust
    ];

    function resize() {
        W = canvas.width = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', () => { resize(); initP(); });

    function rand(a, b) { return Math.random() * (b - a) + a; }
    function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

    // ---- Soot-sprite / floating orb ----
    class SootSprite {
        constructor(spawnAtBottom) {
            this.reset(spawnAtBottom);
        }
        reset(atBottom) {
            const c = COLORS[randInt(0, COLORS.length - 1)];
            this.cx = c;
            this.r = rand(2.5, 6);
            this.x = rand(0, W);
            this.y = atBottom ? H + this.r : rand(0, H);
            this.vx = rand(-0.35, 0.35);
            this.vy = rand(-0.55, -0.15);
            this.alpha = 0;
            this.maxAlpha = rand(0.25, 0.7);
            this.fadeIn = true;
            this.wobble = rand(0, Math.PI * 2);
            this.wobbleSpeed = rand(0.008, 0.025);
            this.wobbleAmp = rand(0.3, 1.2);
            // occasional "sparkle"
            this.sparkle = Math.random() > 0.75;
            this.sparkleT = 0;
        }
        update() {
            this.wobble += this.wobbleSpeed;
            this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmp * 0.08;
            this.y += this.vy;

            // Gentle mouse attraction / avoidance
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (100 - dist) / 100 * 0.5;
                this.x += (dx / dist) * force * 0.4;
                this.y += (dy / dist) * force * 0.4;
            }

            // Fade in / out
            if (this.fadeIn) {
                this.alpha += 0.012;
                if (this.alpha >= this.maxAlpha) { this.alpha = this.maxAlpha; this.fadeIn = false; }
            } else {
                if (this.y < H * 0.3) this.alpha -= 0.008;
            }
            if (this.sparkle) this.sparkleT += 0.12;

            if (this.y < -20 || this.alpha <= 0) this.reset(true);
        }
        draw() {
            const { r: cr, g: cg, b: cb } = this.cx;

            // Soft glow aura
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3.5);
            grd.addColorStop(0, `rgba(${cr},${cg},${cb},${this.alpha * 0.5})`);
            grd.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            // Core orb
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${cr},${cg},${cb},${this.alpha})`;
            ctx.fill();

            // Sparkle cross
            if (this.sparkle) {
                const size = this.r * (0.6 + 0.4 * Math.abs(Math.sin(this.sparkleT)));
                ctx.save();
                ctx.strokeStyle = `rgba(${cr},${cg},${cb},${this.alpha * 0.9})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(this.x - size, this.y); ctx.lineTo(this.x + size, this.y);
                ctx.moveTo(this.x, this.y - size); ctx.lineTo(this.x, this.y + size);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    // ---- Dandelion seed / wind line ----
    class DandelionSeed {
        constructor() { this.reset(); }
        reset() {
            this.x = rand(0, W);
            this.y = rand(H * 0.2, H);
            this.vx = rand(-0.8, 0.8);
            this.vy = rand(-0.6, -0.2);
            this.len = rand(10, 22);
            this.alpha = rand(0.1, 0.25);
            this.angle = rand(-0.3, 0.3);
            this.life = 0;
            this.maxLife = rand(180, 380);
        }
        update() {
            this.x += this.vx + Math.sin(this.life * 0.04) * 0.4;
            this.y += this.vy;
            this.angle += 0.003;
            this.life++;
            if (this.life > this.maxLife || this.y < -30) this.reset();
        }
        draw() {
            const fade = Math.min(1, (this.maxLife - this.life) / 40, this.life / 40);
            const a = this.alpha * fade;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.strokeStyle = `rgba(200,180,130,${a})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(0, -this.len);
            ctx.stroke();
            // little tufts
            for (let i = -2; i <= 2; i++) {
                ctx.beginPath();
                ctx.moveTo(0, -this.len);
                ctx.lineTo(i * 3, -this.len - 5);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    function initP() {
        const count = Math.min(100, Math.floor((W * H) / 9000));
        const seedCount = Math.min(18, Math.floor((W * H) / 60000));
        particles = [
            ...Array.from({ length: count }, () => new SootSprite(false)),
            ...Array.from({ length: seedCount }, () => new DandelionSeed()),
        ];
    }
    initP();

    // Soft connection lines between close orbs
    function drawConnections(orbs) {
        for (let i = 0; i < orbs.length; i++) {
            for (let j = i + 1; j < orbs.length; j++) {
                const dx = orbs[i].x - orbs[j].x;
                const dy = orbs[i].y - orbs[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 90) {
                    const alpha = (1 - d / 90) * 0.06;
                    ctx.beginPath();
                    ctx.moveTo(orbs[i].x, orbs[i].y);
                    ctx.lineTo(orbs[j].x, orbs[j].y);
                    ctx.strokeStyle = `rgba(107,158,120,${alpha})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);

        const orbs = particles.filter(p => p instanceof SootSprite);
        const seeds = particles.filter(p => p instanceof DandelionSeed);

        drawConnections(orbs);

        seeds.forEach(s => { s.update(); s.draw(); });
        orbs.forEach(p => { p.update(); p.draw(); });

        requestAnimationFrame(loop);
    }
    loop();

    document.querySelector('.hero').addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    document.querySelector('.hero').addEventListener('mouseleave', () => {
        mouse.x = -1000; mouse.y = -1000;
    });
})();

// ============================================
//  SCROLL FADE ANIMATIONS
// ============================================
(function initScrollAnimations() {
    const targets = [
        '.product-card',
        '.flow-step',
        '.showcase-card',
        '.research-card',
        '.backer-card',
        '.community-card',
        '.section-header'
    ];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${i * 75}ms`;
            observer.observe(el);
        });
    });
})();

// ---- Smooth anchor scroll ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ---- Gentle card tilt ----
document.querySelectorAll('.product-card, .showcase-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.6s cubic-bezier(.34,1.56,.64,1)';
    });
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.12s ease, border-color 0.3s, box-shadow 0.3s';
    });
});
