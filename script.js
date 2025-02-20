class LoveAnimation {
    constructor() {
        this.canvas = document.getElementById('loveCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.N = 800;
        this.pointer = { x: -1000, y: -1000 }; // Initialize pointer off-screen
        this.animationFrame = null;
        this.isAnimating = false;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.loadAssets();
        this.setupEventListeners();
    }

    setupCanvas() {
        const resize = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        };
        window.addEventListener('resize', resize);
        resize();
    }

    loadAssets() {
        this.heartImg = new Image();
        this.heartImg.src = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/191814/heart_codepen.png';
    }

    setupEventListeners() {
        const updatePointer = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.pointer.x = clientX - rect.left;
            this.pointer.y = clientY - rect.top;

            if (e.touches) this.showTouchIndicator(clientX, clientY);
        };

        window.addEventListener('mousemove', updatePointer);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            updatePointer(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            updatePointer(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            this.pointer.x = -1000; // Move pointer off-screen
            this.pointer.y = -1000;
        });

        // Start animation on click
        document.getElementById('opening_screen').addEventListener('click', () => {
            this.startAnimation();
            document.getElementById('opening_screen').style.opacity = '0';
        });
    }

    showTouchIndicator(x, y) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
            left: ${x}px;
            top: ${y}px;
        `;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Create particles
        for (let i = 0; i < this.N; i++) {
            this.particles.push(new Particle(
                this.ctx,
                this.heartImg,
                this.pointer,
                this.canvas
            ));
        }

        this.animate();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            this.heartImg,
            this.pointer.x - 100,
            this.pointer.y - 100,
            200,
            200
        );

        this.particles.forEach(particle => particle.update());
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(ctx, img, pointer, canvas) {
        this.ctx = ctx;
        this.img = img;
        this.pointer = pointer;
        this.canvas = canvas;

        this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
        this.size = this.isMobile ? 25 + Math.random() * 40 : 15 + Math.random() * 30;
        this.mouseRadius = this.isMobile ? 200 : 150;

        this.reset();
    }

    reset() {
        this.x = (this.canvas.width * 0.5) + (Math.random() * 200 - 100);
        this.y = -this.size - Math.random() * 200;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = Math.random() * 2;
    }

    update() {
        this.y += this.vy;
        this.x += this.vx;
        this.vy += 0.05;

        if (this.y > this.canvas.height) this.reset();

        const dx = this.x - this.pointer.x;
        const dy = this.y - this.pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = this.mouseRadius + this.size * 0.5;

        if (distance < radius) {
            const angle = Math.atan2(dy, dx);
            const force = (radius - distance) * 0.1;

            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
            this.vx = 0.5 * force * Math.cos(angle) + (this.x >= this.pointer.x ? 2 : -2);
            this.vy = 0.5 * force * Math.sin(angle);
        }

        this.draw();
    }

    draw() {
        this.ctx.drawImage(
            this.img,
            this.x - this.size * 0.5,
            this.y - this.size * 0.5,
            this.size,
            this.size
        );
    }
}

// Initialize animation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoveAnimation();
});
