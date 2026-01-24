// Portfolio Entries
const entries = [
    {
        id: '1',
        categories: ['data'],
        title: 'Album Cover Genre Classification via Computer Vision',
        caption: 'Is there something about album covers that can help us catalog them into genres?',
        description: `This project uses computer vision and deep learning to classify album covers into 4 musical genres (HipHop, Rock, Pop, Electronic). I compared traditional CV features covered in lecture (color, edges, texture, faces) against a CNN achieving 40.42% test accuracy.`,
        detailContent: '',
        links: 'https://github.com/psjesusangel/album-genre-classification'
    },
    {
        id: '2',
        categories: ['data'],
        title: 'Text-to-Image Pixel Art Generator',
        caption: 'A text-to-image latent diffusion model for generating 16x16 pixel art sprites',
        description: 'Developed a text-to-image generation system...',
        detailContent: '',
        links: 'https://github.com/psjesusangel/pixel-art-diffusion'
    },
    {
        id: '3',
        categories: ['software'],
        title: 'Music Genre Particle Filter',
        caption: 'Sequential Bayesian Inference for Music Genre Recognition',
        description: `Humans recognize music genres incrementally: from initial uncertainty, distinctive musical features help us oscillate toward a certain genre. The temporal belief-updating suggests that there exists sequential probabilistic inference mechanisms.`,
        detailContent: '',
        links: 'https://github.com/psjesusangel/music-genre-particle-filter'
    },
    {
        id: '4',
        categories: ['software'],
        title: 'Ari — Habit Tracker',
        caption: 'Minimalist desktop habit tracking',
        description: 'Built a desktop application inspired by Aristotle\'s quote: We are what we repeatedly do. Excellence, then, is not an act, but a habit...',
        detailContent: '',
        links: 'https://github.com/psjesusangel/ari'
    },
    {
        id: '5',
        categories: ['writing'],
        title: 'From Cognitive Science to Code',
        caption: 'My journey discovering software engineering',
        description: `Started college thinking I wanted to study how the mind works...`,
        detailContent: '',
        links: ''
    },
    {
        id: '6',
        categories: ['data','writing'],
        title: 'An Analysis of NYC\'s 2025 Mayoral Election',
        caption: 'Using the election results and Census data, I test whether Mamdani\’s coalition is defined by class, education, race, or a combination of these factors.',
        description: `Mamdani has assembled a coalition defying simple categorization, spanning educated
        progressives, economically struggling communities, and multiracial urban neighborhoods. His
        support combines economic distress, educational attainment, and diverse demographics rather
        than any single factor. These findings show economic populism can build winning coalitions in
        diverse cities when combined with progressive cultural messaging. For the Democratic Party, the
        "moderate" versus "progressive" divide may be overstated—candidates appealing across
        economic and racial lines may find substantial opportunities. Mamdani's campaign demonstrates
        that democratic socialist politics can succeed in complex urban environments, a lesson that is
        resonating far beyond New York.`,
        detailContent: '',
        links: 'https://github.com/psjesusangel/2025-nyc-mayoral-election-analysis/tree/main'
    }
];

// Category display names (internal value → button/tag label)
const categoryLabels = {
    software: 'swe',
    data: 'ml/data',
    writing: 'writing'
};

class Carousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.currentSlideEl = document.getElementById('currentSlide');
        this.totalSlidesEl = document.getElementById('totalSlides');
        this.currentIndex = 0;
        this.entries = [];
        this.filteredEntries = [];
        this.activeFilters = new Set();

        // Touch gesture tracking
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.minSwipeDistance = 50;

        this.init();
    }

    init() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const detailModal = document.getElementById('entryDetailModal');
            if (!detailModal.classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.navigate(-1);
                if (e.key === 'ArrowRight') this.navigate(1);
            }
        });

        // Touch gesture navigation
        this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.track.addEventListener('touchend', () => this.handleTouchEnd());

        // Filter buttons (multi-select toggle)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                if (filter === 'all') {
                    this.activeFilters.clear();
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                } else {
                    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                    if (btn.classList.contains('active')) {
                        btn.classList.remove('active');
                        this.activeFilters.delete(filter);
                        if (this.activeFilters.size === 0) {
                            allBtn.classList.add('active');
                        }
                    } else {
                        btn.classList.add('active');
                        allBtn.classList.remove('active');
                        this.activeFilters.add(filter);
                    }
                }
                this.filterEntries();
            });
        });
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        this.touchEndX = e.touches[0].clientX;
        this.touchEndY = e.touches[0].clientY;
    }

    handleTouchEnd() {
        const deltaX = this.touchStartX - this.touchEndX;
        const deltaY = Math.abs(this.touchStartY - this.touchEndY);

        // Only trigger swipe if horizontal movement is greater than vertical
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0) {
                // Swiped left - go to next
                this.navigate(1);
            } else {
                // Swiped right - go to previous
                this.navigate(-1);
            }
        }
    }

    setEntries(entries) {
        this.entries = entries;
        this.filterEntries();
    }

    filterEntries() {
        if (this.activeFilters.size === 0) {
            this.filteredEntries = this.entries;
        } else {
            this.filteredEntries = this.entries.filter(e =>
                [...this.activeFilters].some(f => e.categories.includes(f))
            );
        }
        this.currentIndex = 0;
        this.render();
    }

    render() {
        this.track.innerHTML = '';
        this.totalSlidesEl.textContent = this.filteredEntries.length;

        if (this.filteredEntries.length === 0) {
            this.track.innerHTML = `
                <div class="carousel-item active">
                    <h3>No entries yet</h3>
                    <p>Check back soon!</p>
                </div>
            `;
            return;
        }

        this.filteredEntries.forEach((entry, index) => {
            const item = this.createCarouselItem(entry, index);
            this.track.appendChild(item);
        });

        this.updatePosition();
    }

    createCarouselItem(entry, index) {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.dataset.index = index;

        const links = entry.links ? entry.links.split(',').map(l => l.trim()).filter(l => l) : [];

        item.innerHTML = `
            <div class="entry-tags">
                ${entry.categories.map(cat => `<span class="entry-type ${cat}">${categoryLabels[cat] || cat}</span>`).join('')}
            </div>
            <h3 class="entry-title">${entry.title}</h3>
            <p class="entry-caption">${entry.caption}</p>
            ${links.length > 0 ? `
                <div class="entry-links">
                    ${links.slice(0, 2).map(link => `
                        <a href="${link}" target="_blank" class="entry-link" onclick="event.stopPropagation()">
                            ${this.getLinkLabel(link)} →
                        </a>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Click to navigate to side cards or open detail view for active card
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('entry-link')) {
                if (item.classList.contains('active')) {
                    this.openEntryDetail(entry);
                } else if (item.classList.contains('prev')) {
                    this.navigate(-1);
                } else if (item.classList.contains('next')) {
                    this.navigate(1);
                }
            }
        });

        return item;
    }

    getLinkLabel(url) {
        if (url.includes('github')) return 'GitHub';
        if (url.includes('demo')) return 'Demo';
        if (url.includes('docs')) return 'Docs';
        return 'Link';
    }

    openEntryDetail(entry) {
        const modal = document.getElementById('entryDetailModal');
        const content = document.getElementById('entryDetailContent');

        const links = entry.links ? entry.links.split(',').map(l => l.trim()).filter(l => l) : [];
        const body = entry.detailContent || entry.description;

        content.innerHTML = `
            <div class="entry-detail-tags">
                ${entry.categories.map(cat => `<span class="entry-detail-type ${cat}">${categoryLabels[cat] || cat}</span>`).join('')}
            </div>
            <h1 class="entry-detail-title">${entry.title}</h1>
            <p class="entry-detail-caption">${entry.caption}</p>
            <div class="entry-detail-description">${body}</div>
            ${links.length > 0 ? `
                <div class="entry-detail-links">
                    ${links.map(link => `
                        <a href="${link}" target="_blank" class="entry-detail-link">
                            ${this.getLinkLabel(link)} →
                        </a>
                    `).join('')}
                </div>
            ` : ''}
        `;

        modal.classList.add('active');
    }

    navigate(direction) {
        const total = this.filteredEntries.length;
        if (total === 0) return;

        // Infinite loop with modulo
        this.currentIndex = (this.currentIndex + direction + total) % total;
        this.updatePosition();
    }

    updatePosition() {
        const items = this.track.querySelectorAll('.carousel-item');
        const total = this.filteredEntries.length;

        if (total === 0) return;

        items.forEach((item, index) => {
            item.classList.remove('active', 'prev', 'next', 'hidden');

            if (index === this.currentIndex) {
                item.classList.add('active');
            } else if (total === 2) {
                // With only 2 entries, show the other one to the right
                item.classList.add('next');
            } else if (index === this.getPrevIndex()) {
                item.classList.add('prev');
            } else if (index === this.getNextIndex()) {
                item.classList.add('next');
            } else {
                item.classList.add('hidden');
            }
        });

        this.currentSlideEl.textContent = this.currentIndex + 1;
    }

    getPrevIndex() {
        const total = this.filteredEntries.length;
        return (this.currentIndex - 1 + total) % total;
    }

    getNextIndex() {
        const total = this.filteredEntries.length;
        return (this.currentIndex + 1) % total;
    }
}

// Initialize
const carousel = new Carousel();
carousel.setEntries(entries);

// Entry detail modal controls
const entryDetailModal = document.getElementById('entryDetailModal');
const closeEntryDetail = document.getElementById('closeEntryDetail');

function closeEntryDetailModal() {
    entryDetailModal.classList.add('closing');
    setTimeout(() => {
        entryDetailModal.classList.remove('active', 'closing');
    }, 200);
}

closeEntryDetail.addEventListener('click', closeEntryDetailModal);

entryDetailModal.addEventListener('click', (e) => {
    if (e.target === entryDetailModal) {
        closeEntryDetailModal();
    }
});

// Escape key to close entry detail
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && entryDetailModal.classList.contains('active')) {
        closeEntryDetailModal();
    }
});

// Prevent default drag behavior on images
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Gmail link handler
document.querySelectorAll('.gmail-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const email = link.dataset.email;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // On desktop, offer Gmail web option
        if (!isMobile) {
            e.preventDefault();
            
            // Try Gmail web compose
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&cc=jesus.perezsanchez@yale.edu`;
            const mailtoUrl = link.href;
            
            // Open Gmail web in new tab
            window.open(gmailUrl, '_blank');
            
            // Fallback: if Gmail doesn't open, trigger mailto after delay
            setTimeout(() => {
                const confirmFallback = confirm('If Gmail didn\'t open, click OK to use your default email app.');
                if (confirmFallback) {
                    window.location.href = mailtoUrl;
                }
            }, 1000);
        }
        // On mobile, let mailto work normally
    });
});