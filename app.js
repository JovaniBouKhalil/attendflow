/**
 * Main Application Script
 * Handles application initialization and navigation
 */

// Global application state
let appData = {
    students: [],
    courses: [],
    attendanceRecords: [],
    enrollments: []
};

/**
 * Initialize the application
 * Requirements: 8.4, 10.1
 */
function initializeApp() {
    console.log('Initializing Student Attendance Manager...');
    
    // Initialize storage and load data
    const storageResult = initializeStorage();
    
    if (!storageResult.success) {
        // Display errors to user
        storageResult.errors.forEach(error => {
            console.error('Storage Error:', error);
            showError(error);
        });
    }
    
    // Set application data
    if (storageResult.data) {
        appData = storageResult.data;
        console.log('Data loaded successfully:', appData);
    }
    
    // Initialize navigation
    initializeNavigation();
    
    // Show initial section (Students)
    showSection('students');
    
    console.log('Application initialized successfully');
}

/**
 * Initialize navigation menu
 * Requirements: 10.1, 10.2, 10.9, 10.10
 */
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Toggle mobile menu
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
    
    // Handle navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const section = link.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu if open
            navMenu.classList.remove('open');
            
            // Show selected section
            showSection(section);
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && 
            !e.target.closest('#main-nav')) {
            navMenu.classList.remove('open');
        }
    });
}

/**
 * Show a specific content section
 * @param {string} sectionName - Name of the section to show
 * Requirement: 10.2
 */
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update breadcrumb (will be implemented in later tasks)
    updateBreadcrumb(sectionName);
}

/**
 * Update breadcrumb navigation
 * @param {string} currentSection - Current section name
 * Requirement: 10.3
 */
function updateBreadcrumb(currentSection) {
    const breadcrumb = document.getElementById('breadcrumb');
    
    // For now, just clear breadcrumb in main sections
    // Detailed breadcrumb will be implemented when detail views are added
    breadcrumb.innerHTML = '';
    breadcrumb.classList.remove('visible');
}

/**
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Simple error display for now
    // Will be enhanced with proper UI components in later tasks
    console.error('Error:', message);
    alert('Error: ' + message);
}

/**
 * Show success message to user
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
    // Simple success display for now
    // Will be enhanced with proper UI components in later tasks
    console.log('Success:', message);
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
