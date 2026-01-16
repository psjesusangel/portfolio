// Data Store
class DataStore {
    constructor() {
        this.storageKey = 'jpPerezEntries';
        this.initialize();
    }

    initialize() {
        if (!localStorage.getItem(this.storageKey)) {
            const sampleData = [
            {
                id: '1',
                type: 'project',
                category: 'software',
                title: 'Ari — Habit Tracker',
                caption: 'Minimalist desktop habit tracking with infinite canvas',
                description: `Built a desktop application inspired by Aristote's quote: We are what we repeatedly do. Excellence, then, is not an act, but a habit...`,
                links: 'https://github.com/psjesusangel/ari'
            },
            {
                id: '2',
                type: 'project',
                category: 'data',
                title: 'Text-to-Image Pixel Art Generator',
                caption: 'PyTorch generative model with autoencoders and CLIP',
                description: `Developed a text-to-image generation system...`,
                links: 'https://github.com/psjesusangel/pixel-art-gen'
            },
            {
                id: '3',
                type: 'writing',
                category: 'writing',
                title: 'From Cognitive Science to Code',
                caption: 'My journey discovering software engineering',
                description: `Started college thinking I wanted to study how the mind works...`,
                links: ''
            }
        ];
            this.save(sampleData);
        }
    }

    getAll() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    save(entries) {
        localStorage.setItem(this.storageKey, JSON.stringify(entries));
    }

    add(entry) {
        const entries = this.getAll();
        entry.id = Date.now().toString();
        entries.push(entry);
        this.save(entries);
        return entry;
    }

    update(id, updatedEntry) {
        const entries = this.getAll();
        const index = entries.findIndex(e => e.id === id);
        if (index !== -1) {
            entries[index] = { ...entries[index], ...updatedEntry };
            this.save(entries);
            return entries[index];
        }
        return null;
    }

    delete(id) {
        const entries = this.getAll();
        const filtered = entries.filter(e => e.id !== id);
        this.save(filtered);
        return filtered;
    }
}

// Carousel
// Carousel
class Carousel {
    constructor() {
        this.track = document.getElementById('carouselTrack');
        this.currentSlideEl = document.getElementById('currentSlide');
        this.totalSlidesEl = document.getElementById('totalSlides');
        this.currentIndex = 0;
        this.entries = [];
        this.filteredEntries = [];
        this.currentFilter = 'all';

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

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
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
        if (this.currentFilter === 'all') {
            this.filteredEntries = this.entries;
        } else {
            this.filteredEntries = this.entries.filter(e => e.category === this.currentFilter);
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
            <span class="entry-type ${entry.category}">${entry.category}</span>
            <h3 class="entry-title">${entry.title}</h3>
            <p class="entry-caption">${entry.caption}</p>
            <div class="entry-description">${this.truncateText(entry.description, 200)}</div>
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

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
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

        content.innerHTML = `
            <span class="entry-detail-type ${entry.category}">${entry.category}</span>
            <h1 class="entry-detail-title">${entry.title}</h1>
            <p class="entry-detail-caption">${entry.caption}</p>
            <div class="entry-detail-description">${entry.description}</div>
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
const dataStore = new DataStore();
const carousel = new Carousel();

// Load initial data
carousel.setEntries(dataStore.getAll());

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