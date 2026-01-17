// ========================================
// AxiQuant AI - Main JavaScript
// ========================================

// Initialize EmailJS with your public key
emailjs.init('ttowYJCftsKzoSAGO');

// ========================================
// Mobile Menu Toggle
// ========================================

const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const body = document.body;

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      mobileMenu.classList.remove('open');
      body.style.overflow = '';
    });
  });
}

// ========================================
// Header Scroll Effect
// ========================================

const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ========================================
// Active Nav Link
// ========================================

const currentLocation = location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentLocation || (href === 'index.html' && currentLocation === '')) {
    link.classList.add('active');
  }
});

// ========================================
// Scroll Animations
// ========================================

const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-up');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.card, .service-card, .benefit-card, .value-card').forEach(el => {
  observer.observe(el);
});

// ========================================
// Contact Form with EmailJS
// ========================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    
    // Hide any previous messages
    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    
    // Get form data
    const templateParams = {
      from_name: contactForm.from_name.value,
      from_email: contactForm.from_email.value,
      company: contactForm.company.value || 'Not provided',
      subject: contactForm.subject.value,
      message: contactForm.message.value
    };
    
    // Send email via EmailJS
    emailjs.send('service_8iub6d9', 'template_6zzmzpm', templateParams)
      .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        
        // Show success message
        if (successMsg) {
          successMsg.style.display = 'flex';
          setTimeout(() => {
            successMsg.style.display = 'none';
          }, 5000);
        }
        
        // Reset form
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      })
      .catch(function(error) {
        console.error('FAILED...', error);
        
        // Show error message
        if (errorMsg) {
          errorMsg.style.display = 'flex';
          errorMsg.textContent = 'Failed to send message. Please try again or email us directly.';
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      });
  });
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ========================================
// Loading Spinner Animation
// ========================================

const style = document.createElement('style');
style.textContent = `
  .loading {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(10, 14, 26, 0.3);
    border-top-color: var(--bg-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-right: 0.5rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

// ========================================
// Console Welcome Message
// ========================================

console.log('%cAxiQuant AI', 'font-size: 24px; font-weight: bold; color: #d4a574;');
console.log('%cPowering Decisions with Engineered Intelligence', 'font-size: 14px; color: #9ca3af;');
console.log('%cWebsite: https://axiquantai.in', 'color: #3b82f6;');
