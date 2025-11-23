// Global variables
let userLocation = null;
let currentForts = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    displayQuickAccess();
    displayForts();
    displayInfoCards();
    setupSearchFunctionality();
    setupSmoothScrolling();
});

// Quick Access Fort Buttons
function displayQuickAccess() {
    const quickAccess = document.getElementById('quickAccess');
    const topForts = ['red fort', 'amber fort', 'mehrangarh fort', 'golconda fort', 
                     'agra fort', 'jaisalmer fort', 'raigad fort', 'sinhagad fort'];
    
    topForts.forEach(fortKey => {
        if (fortsData[fortKey]) {
            const btn = document.createElement('button');
            btn.className = 'fort-icon-btn';
            btn.innerHTML = `${fortsData[fortKey].icon} ${fortsData[fortKey].name.split(',')[0]}`;
            btn.onclick = () => selectFort(fortKey);
            quickAccess.appendChild(btn);
        }
    });
}

// Display all forts in showcase
function displayForts() {
    const grid = document.getElementById('fortsGrid');
    const icons = ['🏰', '⚔️', '🛡️', '👑', '🏛️', '🌄', '🕌', '⚜️', '🦁', '🌊', '🏔️', '⭐'];
    let index = 0;
    
    for (let key in fortsData) {
        const fort = fortsData[key];
        const card = document.createElement('div');
        card.className = 'fort-card';
        card.onclick = () => showDetail(key);
        card.innerHTML = `
            <div class="fort-image">${fort.icon || icons[index % icons.length]}</div>
            <div class="fort-info">
                <h3>${fort.name}</h3>
                <p>${fort.description.substring(0, 120)}...</p>
            </div>
        `;
        grid.appendChild(card);
        index++;
    }
}

// Display info cards
function displayInfoCards() {
    const grid = document.getElementById('infoGrid');
    infoCategories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.innerHTML = `
            <div class="info-card-icon">${category.icon}</div>
            <h3>${category.title}</h3>
            <p>${category.desc}</p>
        `;
        grid.appendChild(card);
    });
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('suggestions');

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const matches = Object.keys(fortsData).filter(key => 
            key.includes(query) || 
            fortsData[key].name.toLowerCase().includes(query) ||
            fortsData[key].location.toLowerCase().includes(query)
        );

        if (matches.length > 0) {
            suggestionsDiv.innerHTML = matches.map(key => 
                `<div class="suggestion-item" onclick="selectFort('${key}')">${fortsData[key].name}</div>`
            ).join('');
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.innerHTML = '<div class="suggestion-item">No forts found</div>';
            suggestionsDiv.style.display = 'block';
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchFort();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// Search fort function
function searchFort() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const fortKey = Object.keys(fortsData).find(key => 
        key === query || 
        fortsData[key].name.toLowerCase() === query ||
        fortsData[key].name.toLowerCase().includes(query)
    );

    if (fortKey) {
        showDetail(fortKey);
    } else {
        alert('Fort not found. Please try searching with a different name.');
    }
}

// Select fort from suggestions or buttons
function selectFort(fortKey) {
    document.getElementById('searchInput').value = fortsData[fortKey].name;
    document.getElementById('suggestions').style.display = 'none';
    showDetail(fortKey);
}

// Show fort detail view
function showDetail(fortKey) {
    const fort = fortsData[fortKey];
    const detailView = document.getElementById('detailView');
    const detailContent = document.getElementById('detailContent');

    detailContent.innerHTML = `
        <div class="detail-header">
            <h2>${fort.name}</h2>
            <p class="location">📍 ${fort.location}</p>
        </div>

        <div class="detail-content">
            <div class="info-section">
                <h3>Historical Information</h3>
                <div class="info-item"><strong>Built:</strong> ${fort.built}</div>
                <div class="info-item"><strong>Built By:</strong> ${fort.builtBy}</div>
                <div class="info-item"><strong>Architecture:</strong> ${fort.architecture}</div>
                <div class="info-item"><strong>UNESCO Status:</strong> ${fort.unesco}</div>
                <div class="info-item"><strong>Construction Period:</strong> ${fort.timePeriod}</div>
                <div class="info-item"><strong>Construction Cost:</strong> ${fort.constructionCost}</div>
                <div class="info-item"><strong>Description:</strong> ${fort.description}</div>
            </div>

            <div class="info-section">
                <h3>Visitor Information</h3>
                <div class="info-item"><strong>Visiting Hours:</strong> ${fort.visitingHours}</div>
                <div class="info-item"><strong>Entry Fee:</strong> ${fort.entryFee}</div>
                <div class="info-item"><strong>Best Time to Visit:</strong> ${fort.bestTime}</div>
                <div class="info-item"><strong>Nearby Attractions:</strong> ${fort.nearbyAttractions}</div>
            </div>
        </div>

        <div class="info-section" style="grid-column: 1 / -1;">
            <h3>Significance</h3>
            <div class="info-item">${fort.significance}</div>
        </div>

        <div class="map-container" id="map-${fortKey}"></div>
        <button class="directions-btn" onclick="getDirections(${fort.lat}, ${fort.lng}, '${fort.name}')">
            🧭 Get Directions to ${fort.name}
        </button>
    `;

    detailView.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => initMap(fortKey, fort.lat, fort.lng), 100);
}

// Initialize individual fort map
function initMap(fortKey, lat, lng) {
    const mapContainer = document.getElementById(`map-${fortKey}`);
    if (!mapContainer) return;

    const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=14&output=embed`;
    mapContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            style="border:0" 
            src="${mapUrl}" 
            allowfullscreen>
        </iframe>
    `;
}

// Get directions to fort
function getDirections(lat, lng, name) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const url = `https://www.google.com/maps/dir/${userLat},${userLng}/${lat},${lng}`;
                window.open(url, '_blank');
            },
            function(error) {
                const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                window.open(url, '_blank');
            }
        );
    } else {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    }
}

// Close detail view
function closeDetail() {
    document.getElementById('detailView').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Live Map Functions
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                // Update map to show user location
                const mapFrame = document.getElementById('mapFrame');
                mapFrame.src = `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=10&output=embed`;
                
                // Find nearby forts
                findNearbyForts();
                
                alert('✅ Your location has been detected! Scroll down to see nearby forts.');
            },
            function(error) {
                alert('❌ Unable to get your location. Please enable location services.');
            }
        );
    } else {
        alert('❌ Geolocation is not supported by your browser.');
    }
}

function findNearbyForts() {
    if (!userLocation) {
        alert('Please enable location first!');
        return;
    }

    const nearbyList = document.getElementById('nearbyList');
    const fortsWithDistance = [];

    // Calculate distance to each fort
    for (let key in fortsData) {
        const fort = fortsData[key];
        const distance = calculateDistance(
            userLocation.lat, userLocation.lng,
            fort.lat, fort.lng
        );
        fortsWithDistance.push({ key, fort, distance });
    }

    // Sort by distance
    fortsWithDistance.sort((a, b) => a.distance - b.distance);

    // Display top 5 nearest forts
    const nearest = fortsWithDistance.slice(0, 5);
    nearbyList.innerHTML = nearest.map(item => `
        <div class="nearby-fort-item" onclick="selectFort('${item.key}')">
            <strong>${item.fort.name}</strong><br>
            📍 ${item.fort.location}<br>
            🚗 ${item.distance.toFixed(1)} km away
        </div>
    `).join('');
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function showAllForts() {
    // Calculate center point of all forts
    let totalLat = 0, totalLng = 0, count = 0;
    
    for (let key in fortsData) {
        totalLat += fortsData[key].lat;
        totalLng += fortsData[key].lng;
        count++;
    }
    
    const centerLat = totalLat / count;
    const centerLng = totalLng / count;
    
    // Update map to show all forts
    const mapFrame = document.getElementById('mapFrame');
    mapFrame.src = `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=5&output=embed`;
    
    alert('🗺️ Showing all forts across India!');
}

function filterByState() {
    const stateFilter = document.getElementById('stateFilter').value;
    
    if (stateFilter === 'all') {
        showAllForts();
        return;
    }
    
    // Find forts in selected state
    const stateForts = [];
    for (let key in fortsData) {
        if (fortsData[key].state && fortsData[key].state.toLowerCase().includes(stateFilter.toLowerCase())) {
            stateForts.push(fortsData[key]);
        }
    }
    
    if (stateForts.length > 0) {
        // Calculate center of state forts
        let totalLat = 0, totalLng = 0;
        stateForts.forEach(fort => {
            totalLat += fort.lat;
            totalLng += fort.lng;
        });
        
        const centerLat = totalLat / stateForts.length;
        const centerLng = totalLng / stateForts.length;
        
        const mapFrame = document.getElementById('mapFrame');
        mapFrame.src = `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=7&output=embed`;
        
        alert(`🏰 Showing ${stateForts.length} fort(s) in ${stateFilter}!`);
    } else {
        alert('No forts found in this state!');
    }
}

// Navigation functions
function goHome() {
    const detailView = document.getElementById('detailView');
    if (detailView.style.display === 'block') {
        closeDetail();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    document.getElementById('searchInput').value = '';
    document.getElementById('suggestions').style.display = 'none';
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}