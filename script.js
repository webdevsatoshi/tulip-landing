/**
 * Tulip Landing Page - JavaScript
 * Handles animations, scroll effects, and interactive components
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavScroll();
    initScrollAnimations();
    initMessageAnimation();
    initFaqAccordion();
});

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
 * iPhone message animation
 * Staggered appearance of chat messages
 */
function initMessageAnimation() {
    const messages = document.querySelectorAll('.message');
    if (messages.length === 0) return;

    // Check if the chat is in view
    const chat = document.getElementById('chat');
    if (!chat) return;

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateMessages(messages);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    observer.observe(chat);
}

/**
 * Animate messages with staggered timing
 */
function animateMessages(messages) {
    messages.forEach((message) => {
        const delay = parseInt(message.dataset.delay, 10) || 0;
        setTimeout(() => {
            message.classList.add('visible');
        }, delay);
    });
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
