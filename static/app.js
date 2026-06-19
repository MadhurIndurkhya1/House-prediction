document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('prediction-form');
    const locationInput = document.getElementById('location-search');
    const locationDropdown = document.getElementById('location-dropdown');
    const locationList = document.getElementById('location-list');
    const dropdownStatus = document.getElementById('dropdown-status');
    const locationClear = document.getElementById('location-clear');
    
    const resultPlaceholder = document.getElementById('result-placeholder');
    const resultDisplay = document.getElementById('result-display');
    const resultLoader = document.getElementById('result-loader');
    
    const priceText = document.getElementById('predicted-price');
    const approxInrText = document.getElementById('approx-inr-text');
    const summaryLoc = document.getElementById('summary-loc');
    const summaryArea = document.getElementById('summary-area');
    const summaryBhk = document.getElementById('summary-bhk');
    const summaryBath = document.getElementById('summary-bath');

    let allLocations = [];
    let highlightedIndex = -1;

    // 1. Fetch Locations on Page Load
    fetch('/api/locations')
        .then(response => response.json())
        .then(data => {
            allLocations = data;
            if (allLocations.length > 0) {
                dropdownStatus.style.display = 'none';
                locationList.style.display = 'block';
                populateDropdown(allLocations);
            } else {
                dropdownStatus.textContent = 'No locations found';
            }
        })
        .catch(err => {
            console.error('Error fetching locations:', err);
            dropdownStatus.textContent = 'Failed to load locations';
        });

    // Populate the dropdown UL element
    function populateDropdown(list) {
        locationList.innerHTML = '';
        list.forEach(loc => {
            const li = document.createElement('li');
            li.className = 'dropdown-item';
            li.textContent = loc;
            li.addEventListener('click', () => selectLocation(loc));
            locationList.appendChild(li);
        });
    }

    // Handle Location Selection
    function selectLocation(value) {
        locationInput.value = value;
        locationClear.style.display = 'flex';
        closeDropdown();
    }

    // Clear Location Input
    locationClear.addEventListener('click', () => {
        locationInput.value = '';
        locationClear.style.display = 'none';
        locationInput.focus();
        filterLocations();
        openDropdown();
    });

    // Filter locations on typing
    locationInput.addEventListener('input', () => {
        filterLocations();
        if (locationInput.value.length > 0) {
            locationClear.style.display = 'flex';
        } else {
            locationClear.style.display = 'none';
        }
        openDropdown();
    });

    function filterLocations() {
        const query = locationInput.value.toLowerCase().trim();
        const filtered = allLocations.filter(loc => loc.toLowerCase().includes(query));
        populateDropdown(filtered);
        highlightedIndex = -1;

        if (filtered.length === 0) {
            dropdownStatus.style.display = 'block';
            dropdownStatus.textContent = 'No matching locations';
            locationList.style.display = 'none';
        } else {
            dropdownStatus.style.display = 'none';
            locationList.style.display = 'block';
        }
    }

    // Open/Close Dropdown handlers
    locationInput.addEventListener('focus', () => {
        openDropdown();
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#location-select-container')) {
            closeDropdown();
        }
    });

    function openDropdown() {
        locationDropdown.style.display = 'block';
    }

    function closeDropdown() {
        locationDropdown.style.display = 'none';
        highlightedIndex = -1;
    }

    // Keyboard Accessibility for searchable select dropdown
    locationInput.addEventListener('keydown', (e) => {
        const items = locationList.getElementsByClassName('dropdown-item');
        if (locationDropdown.style.display === 'none' || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex + 1) % items.length;
            updateHighlight(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
            updateHighlight(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex > -1 && items[highlightedIndex]) {
                selectLocation(items[highlightedIndex].textContent);
            }
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    function updateHighlight(items) {
        Array.from(items).forEach((item, index) => {
            if (index === highlightedIndex) {
                item.classList.add('highlighted');
                // Scroll into view if needed
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    // 2. Form Submission & Estimation
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const location = locationInput.value.trim();
        const total_sqft = parseFloat(document.getElementById('total_sqft').value);
        const bhk = parseInt(document.querySelector('input[name="bhk"]:checked').value);
        const bath = parseInt(document.querySelector('input[name="bath"]:checked').value);

        // Client-side validations
        if (!location || !allLocations.includes(location)) {
            alert('Please select a valid location from the dropdown.');
            locationInput.focus();
            return;
        }

        if (isNaN(total_sqft) || total_sqft < 100) {
            alert('Please enter a valid built-up area (minimum 100 sq.ft.).');
            return;
        }

        // Show loading state
        resultPlaceholder.style.display = 'none';
        resultDisplay.style.display = 'none';
        resultLoader.style.display = 'flex';

        // Fetch prediction from server
        fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location: location,
                total_sqft: total_sqft,
                bhk: bhk,
                bath: bath
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Server error'); });
            }
            return response.json();
        })
        .then(data => {
            // Update Summary Card
            summaryLoc.textContent = location;
            summaryArea.textContent = `${total_sqft.toLocaleString()} sq. ft.`;
            summaryBhk.textContent = `${bhk} BHK`;
            summaryBath.textContent = `${bath} Bath`;

            // Display Results with animations
            resultLoader.style.display = 'none';
            resultDisplay.style.display = 'flex';

            // Animated Count-Up for price
            animatePrice(data.price_lakhs);
        })
        .catch(err => {
            console.error('Estimation error:', err);
            resultLoader.style.display = 'none';
            resultPlaceholder.style.display = 'flex';
            alert(`Estimation failed: ${err.message}`);
        });
    });

    // Count-Up Animation for predicted price
    function animatePrice(targetVal) {
        const duration = 1200; // ms
        const frameRate = 60; // fps
        const totalFrames = Math.round(duration / (1000 / frameRate));
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = easeOutQuad(frame / totalFrames);
            const currentVal = progress * targetVal;
            
            priceText.textContent = currentVal.toFixed(2);
            approxInrText.textContent = `≈ ${formatToIndianCurrency(currentVal * 100000)}`;

            if (frame >= totalFrames) {
                clearInterval(timer);
                priceText.textContent = targetVal.toFixed(2);
                approxInrText.textContent = `≈ ${formatToIndianCurrency(targetVal * 100000)}`;
            }
        }, 1000 / frameRate);
    }

    // Easing helper
    function easeOutQuad(x) {
        return 1 - (1 - x) * (1 - x);
    }

    // Format numbers as INR format (e.g. ₹1,20,50,000)
    function formatToIndianCurrency(num) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(num);
    }
});
