/* ═══════════════════════════════════════════════════════════
   JOY CART — Interactive JavaScript
   Navbar, Carousel, Ratings, Forms, Animations
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─── NAVBAR SCROLL EFFECT ────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ─── MOBILE NAV TOGGLE ───────────────────────────
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // ─── ANIMATED STAT COUNTERS ──────────────────────
    const counters = document.querySelectorAll('.stat-number');
    let countersDone = false;

    function animateCounters() {
        if (countersDone) return;
        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const start = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = eased * target;
                counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = isDecimal ? target.toFixed(1) : target;
                }
            }
            requestAnimationFrame(updateCounter);
        });
        countersDone = true;
    }

    // Trigger counters when hero is visible
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) animateCounters();
        });
    }, { threshold: 0.3 });
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) heroObserver.observe(heroStats);

    // ─── SCROLL REVEAL ANIMATION ─────────────────────
    const revealElements = document.querySelectorAll('[data-scroll-reveal]');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, index * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // ─── TESTIMONIAL CAROUSEL ────────────────────────
    const track = document.getElementById('testimonialTrack');
    const cards = track.querySelectorAll('.testimonial-card');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;
    const totalSlides = cards.length;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }

    function goToSlide(n) {
        currentSlide = n;
        if (currentSlide < 0) currentSlide = totalSlides - 1;
        if (currentSlide >= totalSlides) currentSlide = 0;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Auto-play
    let autoPlay = setInterval(() => goToSlide(currentSlide + 1), 5000);
    const carousel = document.getElementById('testimonialCarousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carousel.addEventListener('mouseleave', () => {
        autoPlay = setInterval(() => goToSlide(currentSlide + 1), 5000);
    });

    // ─── STAR RATING WIDGET ──────────────────────────
    const starRating = document.getElementById('starRating');
    const stars = starRating.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= val);
            });
        });

        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
            });
        });
    });

    starRating.addEventListener('mouseleave', () => {
        stars.forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
        });
    });

    // Submit Review
    const submitReview = document.getElementById('submitReview');
    submitReview.addEventListener('click', () => {
        const name = document.getElementById('reviewerName').value.trim();
        const text = document.getElementById('reviewText').value.trim();

        if (!selectedRating) {
            showToast('Please select a star rating!', 'warning');
            return;
        }
        if (!name) {
            showToast('Please enter your name!', 'warning');
            return;
        }
        if (!text) {
            showToast('Please write your review!', 'warning');
            return;
        }

        // Add review to carousel
        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const newCard = document.createElement('div');
        newCard.classList.add('testimonial-card');
        newCard.innerHTML = `
            <div class="testimonial-stars">${'★'.repeat(selectedRating)}${'☆'.repeat(5 - selectedRating)}</div>
            <p class="testimonial-text">"${text}"</p>
            <div class="testimonial-author">
                <div class="author-avatar">${initials}</div>
                <div>
                    <strong>${name}</strong>
                    <span>New Review</span>
                </div>
            </div>
        `;
        track.appendChild(newCard);

        // Reset form
        selectedRating = 0;
        stars.forEach(s => s.classList.remove('active'));
        document.getElementById('reviewerName').value = '';
        document.getElementById('reviewText').value = '';

        // Update dots
        const newDot = document.createElement('div');
        newDot.classList.add('carousel-dot');
        newDot.addEventListener('click', () => goToSlide(track.children.length - 1));
        dotsContainer.appendChild(newDot);

        // Navigate to new review
        goToSlide(track.children.length - 1);
        showToast('Thank you for your review! 🎉', 'success');
    });

    // ─── BOOKING FORM ────────────────────────────────
    const bookingForm = document.getElementById('bookingForm');
    const successModal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');

    // Set min date to today
    const eventDate = document.getElementById('eventDate');
    const today = new Date().toISOString().split('T')[0];
    eventDate.setAttribute('min', today);

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const date = document.getElementById('eventDate').value;

        if (!name || !email || !phone || !date) {
            showToast('Please fill in all required fields!', 'warning');
            return;
        }

        // Collect all form data
        const guests = document.getElementById('guestCount').value;
        const budget = document.getElementById('budget').value;
        const services = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
        const specialRequests = document.getElementById('specialRequests').value.trim();

        // Save to localStorage database
        const bookings = JSON.parse(localStorage.getItem('jc_bookings') || '[]');
        const newBooking = {
            id: Date.now(),
            name,
            email,
            phone,
            date,
            guests,
            budget,
            services,
            specialRequests,
            status: 'new',
            createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        };
        bookings.push(newBooking);
        localStorage.setItem('jc_bookings', JSON.stringify(bookings));

        // Show success modal
        successModal.classList.add('active');
        bookingForm.reset();
    });

    closeModal.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) successModal.classList.remove('active');
    });

    // ─── TOAST NOTIFICATION ──────────────────────────
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 16px 28px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                    'linear-gradient(135deg, #6c63ff, #3b82f6)'};
            color: #fff;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            font-weight: 500;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 3000;
            animation: toastIn 0.4s ease;
            max-width: 360px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
    `;
    document.head.appendChild(style);

    // ─── SMOOTH SCROLL FOR ALL ANCHOR LINKS ──────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ─── ACTIVE NAV LINK HIGHLIGHT ───────────────────
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    });

});
