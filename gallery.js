// Gallery photos - edit descriptions here
// Each photo has an id for efficient keying during filter/sort/search operations
const photos = [
    {
        id: 'branford',
        src: 'images/gallery/branford.jpeg',
        caption: 'branford',
        description: 'this is branford, one of yale\'s fourteen colleges, and my home for the first three years of my undergrad. don\'t be tricked by what others may tell you, this is the best residential college and boasts the best courtyard ;)'
    },
    {
        id: 'copenhagen',
        src: 'images/gallery/copenhagen.jpeg',
        caption: 'copenhagen',
        description: 'one of my highlights from visiting copenhagen, denmark was torvehallerne market! the fish and chips from this stand is one of the best meals i\'ve ever had!'
    },
    {
        id: 'dogs',
        src: 'images/gallery/dogs.jpeg',
        caption: 'dogs',
        description: 'meet mocha (right) and horchata (left), my two maltipoos! i woke them up for this photo -- i promise they\'re normally happier.'
    },
    {
        id: 'fornalutx',
        src: 'images/gallery/fornalutx.jpeg',
        caption: 'fornalutx',
        description: 'during my trip to mallorca, i was told to visit this small town on the island. even after biking from palma (20+ miles!) to see it in 90°F weather, i can say it was worth it.'
    },
    {
        id: 'inrainbows',
        src: 'images/gallery/inrainbows.jpg',
        caption: 'in rainbows',
        description: 'radiohead\'s in rainbows is one of the best pieces of art i\'ve had the privilege of experiencing. if you\'ve never listened it, do it right now! weird fishes / arpeggi is my favorite song in the album.'
    },
    {
        id: 'madrid',
        src: 'images/gallery/madrid.jpeg',
        caption: 'madrid',
        description: 'summer 2025, i studied abroad in madrid, spain. outside of doing blockchain research, building apps for my job, and going to class, it was my first time outside of the americas. madrid was magical and i can\'t wait to return.'
    },
    {
        id: 'mallorca',
        src: 'images/gallery/mallorca.jpeg',
        caption: 'mallorca',
        description: 'soller, mallorca was another beautiful town i visited on the island. the sunsets i got to see here will be forever burned into my memory. oh, and i got stung by a jellyfish here.'
    },
    {
        id: 'monterrey',
        src: 'images/gallery/monterrey.jpeg',
        caption: 'monterrey',
        description: 'me in monterrey. i\'ve always enjoyed the ocean. whenever i\'m home for break, my girlfriend and i make it a point to visit monterrey, carmel, or santa cruz whenever we can. on this day, we were treated to surfers, otters, and seals.'
    },
    {
        id: 'thegame',
        src: 'images/gallery/thegame.jpeg',
        caption: 'the game',
        description: 'aftermath of beating harvard in the iconic game in 2025. #4peat.'
    },
    {
        id: 'thenewabnormal',
        src: 'images/gallery/thenewabnormal.jpeg',
        caption: 'the new abnormal',
        description: 'the strokes has always been one of my favorite bands. i still remember being surprised with this gem in the middle of quarantine during my junior year of high school. if i had to choose, ode to the mets is my favorite song from the new abnormal album, though i love them all equally.'
    },
    {
        id: 'californianebula',
        src: 'images/gallery/californianebula.jpg',
        caption: 'california nebula',
        description: 'if you\'ve never listened to the shoegaze genre, i don\'t blame you. even as a long time fan of it, it can get a little stale and messy. that said, california nebula by chinese band 缺省 (default) is fantastic. no favorites here, just close your eyes and listen to the album in its entirety.'
    }
];

// Current display order (mutated by shuffle/sort/filter)
let displayOrder = [...photos];

// Assign a slight random rotation to each polaroid for a scattered look
function getRotation(index) {
    const rotations = [-3, 2, -1.5, 3, -2, 1.5, -2.5, 2.5, -1];
    return rotations[index % rotations.length];
}

// Render gallery
function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';

    displayOrder.forEach((photo, index) => {
        const polaroid = document.createElement('div');
        polaroid.className = 'polaroid';
        polaroid.dataset.id = photo.id;
        polaroid.style.setProperty('--rotation', `${getRotation(index)}deg`);

        polaroid.innerHTML = `
            <div class="polaroid-inner">
                <div class="polaroid-front">
                    <div class="polaroid-image-wrapper">
                        <img src="${photo.src}" alt="${photo.caption}" class="polaroid-image" loading="lazy">
                    </div>
                    <div class="polaroid-caption">${photo.caption}</div>
                </div>
                <div class="polaroid-back">
                    <div class="polaroid-back-caption">${photo.caption}</div>
                    <div class="polaroid-back-description">${photo.description}</div>
                </div>
            </div>
        `;

        polaroid.addEventListener('click', () => {
            polaroid.classList.toggle('flipped');
        });

        grid.appendChild(polaroid);
    });
}

// FLIP animation shuffle
function shuffleGallery() {
    const grid = document.getElementById('galleryGrid');
    const cards = [...grid.querySelectorAll('.polaroid')];

    // FIRST: record current positions
    const firstPositions = new Map();
    cards.forEach(card => {
        firstPositions.set(card.dataset.id, card.getBoundingClientRect());
    });

    // Shuffle displayOrder (Fisher-Yates)
    for (let i = displayOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [displayOrder[i], displayOrder[j]] = [displayOrder[j], displayOrder[i]];
    }

    // Re-render in new order
    renderGallery();

    // LAST: get new positions and INVERT + PLAY
    const newCards = [...grid.querySelectorAll('.polaroid')];
    newCards.forEach((card, index) => {
        const id = card.dataset.id;
        const first = firstPositions.get(id);
        const last = card.getBoundingClientRect();

        const dx = first.left - last.left;
        const dy = first.top - last.top;

        if (dx === 0 && dy === 0) return;

        // Assign new rotation
        card.style.setProperty('--rotation', `${getRotation(index)}deg`);

        // INVERT: move to old position
        card.style.transform = `translate(${dx}px, ${dy}px) rotate(0deg)`;
        card.style.transition = 'none';

        // PLAY: animate to new position
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                card.style.transform = `rotate(var(--rotation, 0deg))`;
            });
        });
    });
}

// Initialize
renderGallery();
