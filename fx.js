(function() {
  'use strict';
  
  let canvas, ctx, particles = [], animationId;
  let isRunning = false, isReducedMotion = false, isTabHidden = false;
  
  // Check for reduced motion preference
  function checkReducedMotion() {
    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  // Tab visibility handling
  function handleVisibilityChange() {
    isTabHidden = document.hidden;
    if (isTabHidden && isRunning) {
      stopParticles();
    } else if (!isTabHidden && !isRunning && !isReducedMotion) {
      // Don't auto-restart, let user control it
    }
  }
  
  // Initialize canvas
  function initCanvas() {
    canvas = document.getElementById('fx-particles');
    if (!canvas) return false;
    
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return true;
  }
  
  // Resize canvas to fill viewport
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // Particle class
  function Particle() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 0.5;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.hue = Math.random() * 60 + 180; // Blue to cyan range
  }
  
  // Update particle position
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    
    // Wrap around edges
    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  };
  
  // Draw particle
  Particle.prototype.draw = function() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = `hsl(${this.hue}, 70%, 60%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  
  // Create particles
  function createParticles() {
    particles = [];
    const count = Math.floor(Math.random() * 41) + 120; // 120-160 particles
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }
  
  // Animation loop
  function animate() {
    if (!isRunning || isReducedMotion || isTabHidden) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });
    
    animationId = requestAnimationFrame(animate);
  }
  
  // Public API
  window.fx = {
    startParticles: function() {
      if (!initCanvas()) return;
      checkReducedMotion();
      
      if (isReducedMotion) return;
      
      isRunning = true;
      createParticles();
      canvas.style.display = 'block';
      animate();
    },
    
    stopParticles: function() {
      isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (canvas) {
        canvas.style.display = 'none';
      }
    }
  };
  
  // Event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', checkReducedMotion);
  
})();
