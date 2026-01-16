// Gallery Data Store
class GalleryStore {
    constructor() {
        this.storageKey = 'jpPerezGallery';
        this.initialize();
    }

    initialize() {
        if (!localStorage.getItem(this.storageKey)) {
            // Initialize with placeholder image
            const sampleData = [
                {
                    id: '1',
                    imageData: 'images/gallery/inrainbows.jpg',
                    caption: '',
                    tags: '',
                    uploadDate: new Date().toISOString()
                }
            ];
            this.save(sampleData);
        }
    }

    getAll() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    save(photos) {
        localStorage.setItem(this.storageKey, JSON.stringify(photos));
    }
}

// Gallery Manager
class Gallery {
    constructor() {
        this.store = new GalleryStore();
        this.photos = [];
        this.currentPhotoIndex = 0;

        this.elements = {
            grid: document.getElementById('galleryGrid'),
            photoModal: document.getElementById('photoModal'),
            photoDetail: document.getElementById('photoDetail')
        };

        this.init();
    }

    init() {
        this.loadPhotos();

        // Modal close on outside click
        this.elements.photoModal.addEventListener('click', (e) => {
            if (e.target === this.elements.photoModal) {
                this.closePhotoModal();
            }
        });

        // Keyboard navigation in photo modal
        document.addEventListener('keydown', (e) => {
            if (this.elements.photoModal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closePhotoModal();
                } else if (e.key === 'ArrowLeft') {
                    this.navigatePhoto(-1);
                } else if (e.key === 'ArrowRight') {
                    this.navigatePhoto(1);
                }
            }
        });
    }

    loadPhotos() {
        this.photos = this.store.getAll();
        this.renderGallery();
    }

    renderGallery() {
        if (this.photos.length === 0) {
            this.elements.grid.className = 'gallery-grid empty';
            this.elements.grid.innerHTML = `
                <div class="empty-state">
                    <p>No photos yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        this.elements.grid.className = 'gallery-grid';
        this.elements.grid.innerHTML = '';

        this.photos.forEach((photo, index) => {
            const card = this.createPhotoCard(photo, index);
            this.elements.grid.appendChild(card);
        });
    }

    createPhotoCard(photo, index) {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const uploadDate = new Date(photo.uploadDate);
        const formattedDate = uploadDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const tags = photo.tags ? photo.tags.split(',').map(t => t.trim()).filter(t => t) : [];

        card.innerHTML = `
            <div class="photo-image-wrapper">
                <img src="${photo.imageData}" alt="${photo.caption || 'Gallery photo'}" class="photo-image">
            </div>
            <div class="photo-info">
                ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
                <div class="photo-meta">${formattedDate}</div>
                ${tags.length > 0 ? `
                    <div class="photo-tags">
                        ${tags.map(tag => `<span class="photo-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        // Click to view
        card.addEventListener('click', () => {
            this.openPhotoModal(photo, index);
        });

        return card;
    }

    openPhotoModal(photo, index) {
        const uploadDate = new Date(photo.uploadDate);
        const formattedDate = uploadDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const tags = photo.tags ? photo.tags.split(',').map(t => t.trim()).filter(t => t) : [];

        this.elements.photoDetail.innerHTML = `
            <div class="photo-detail-container">
                <div class="photo-detail-image-wrapper">
                    <img src="${photo.imageData}" alt="${photo.caption || 'Gallery photo'}" class="photo-detail-image">
                </div>
                <div class="photo-detail-info">
                    ${photo.caption ? `<h3 class="photo-detail-caption">${photo.caption}</h3>` : '<h3 class="photo-detail-caption">[untitled]</h3>'}
                    <div class="photo-detail-meta">
                        ${formattedDate}
                    </div>
                    ${tags.length > 0 ? `
                        <div class="photo-detail-tags">
                            ${tags.map(tag => `<span class="photo-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class="photo-detail-actions">
                        <button class="btn-secondary" onclick="gallery.closePhotoModal()">CLOSE</button>
                    </div>
                </div>
            </div>
        `;

        this.currentPhotoIndex = index;
        this.elements.photoModal.classList.add('active');
    }

    closePhotoModal() {
        this.elements.photoModal.classList.remove('active');
    }

    navigatePhoto(direction) {
        const newIndex = this.currentPhotoIndex + direction;
        if (newIndex >= 0 && newIndex < this.photos.length) {
            this.openPhotoModal(this.photos[newIndex], newIndex);
        }
    }
}

// Initialize
const gallery = new Gallery();

// Prevent default drag on images
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
