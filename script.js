/**
 * Tulip Landing Page - JavaScript
 * Handles animations, scroll effects, and interactive components
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavScroll();
    initScrollAnimations();
    initFaqAccordion();
    initBetaSignupForms();
    initRotatingHeadline();
});

/**
 * Theme switching functionality
 * Detects system preference and allows manual toggle
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    // Check for saved theme preference, otherwise use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Toggle theme on button click
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
    });
}

/**
 * Navigation scroll state
 * Adds background/shadow to nav when scrolled
 */
function initNavScroll() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
}

/**
 * Scroll-triggered fade-in animations
 * Uses Intersection Observer for performance
 */
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    fadeElements.forEach((el) => observer.observe(el));
}


/**
 * FAQ Accordion
 * Smooth expand/collapse for FAQ items
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach((item) => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all other items
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem.classList.remove('open');
                    const btn = otherItem.querySelector('.faq-question');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            item.classList.toggle('open');
            question.setAttribute('aria-expanded', !isOpen);
        });
    });
}

/**
 * Beta Signup Forms
 * Handles form submission to Neon database
 */
function initBetaSignupForms() {
    const forms = document.querySelectorAll('.beta-signup-form');
    if (forms.length === 0) return;

    forms.forEach((form) => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const email = formData.get('email');
            const phone = formData.get('phone') || null;
            const statusEl = form.querySelector('.form-status');
            const submitBtn = form.querySelector('button[type="submit"]');

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Joining...';

            try {
                // Calls the Vercel serverless function
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, phone }),
                });

                if (response.ok) {
                    statusEl.textContent = "You're on the list! We'll be in touch soon.";
                    statusEl.className = 'form-status success';
                    form.reset();
                } else {
                    throw new Error('Failed to submit');
                }
            } catch (error) {
                statusEl.textContent = 'Something went wrong. Please try again.';
                statusEl.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join Beta';
            }
        });
    });
}

/**
 * Rotating Headline Wheel
 * Cycles through phrases with infinite seamless vertical scroll
 */
function initRotatingHeadline() {
    const container = document.getElementById('wheel-container');
    if (!container) return;

    const originalItems = Array.from(container.querySelectorAll('.wheel-item'));
    if (originalItems.length === 0) return;

    // Clone first few items and append to end for seamless loop
    const cloneCount = 3;
    for (let i = 0; i < cloneCount; i++) {
        const clone = originalItems[i].cloneNode(true);
        clone.classList.add('clone');
        container.appendChild(clone);
    }

    const allItems = container.querySelectorAll('.wheel-item');
    let currentIndex = 0;
    const interval = 2000; // 2 seconds between rotations
    const itemHeight = 1.2; // em units, matches CSS
    const totalOriginal = originalItems.length;

    // Set initial active state
    allItems[0].classList.add('active');

    function rotate() {
        // Remove active from current
        allItems[currentIndex].classList.remove('active');

        // Move to next
        currentIndex++;

        // Add active to new current
        allItems[currentIndex].classList.add('active');

        // Move the container up
        const offset = currentIndex * itemHeight;
        container.style.transform = `translateY(-${offset}em)`;

        // When we reach the clones, instantly jump back to start
        if (currentIndex >= totalOriginal) {
            setTimeout(() => {
                // Disable transition for instant jump
                container.style.transition = 'none';

                // Remove active from clone
                allItems[currentIndex].classList.remove('active');
                currentIndex = 0;

                // Add active to first item
                allItems[0].classList.add('active');

                // Reset position
                container.style.transform = 'translateY(0)';

                // Re-enable transition after a frame
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        container.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    });
                });
            }, 500); // Wait for scroll animation to finish
        }
    }

    // Start rotation
    setInterval(rotate, interval);
}

/**
 * Smooth scroll for anchor links
 * (Backup for browsers without CSS scroll-behavior support)
 */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
