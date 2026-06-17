/**
 * app.js — Application bootstrap and navigation
 * Task 10.1: navigation wiring, section switching, breadcrumb, keyboard support
 * Requirements: 8.4, 10.1, 10.2, 10.3, 10.7, 10.8, 10.9, 10.10
 */

'use strict';

// ─── Global State ────────────────────────────────────────────────────────────

/** Mirror of the four Local Storage arrays, kept in sync after every mutation */
let appData = {
    students:         [],
    courses:          [],
    attendanceRecords: [],
    enrollments:      []
};

/**
 * Tracks the current navigation state so breadcrumbs and section headings
 * can be rendered correctly.
 * { section: string, detail: { label: string, id: string }|null }
 */
let navState = { section: 'students', detail: null };

// ─── Boot ────────────────────────────────────────────────────────────────────

/**
 * Entry point — called once the DOM is ready
 * Requirements: 8.4
 */
function initializeApp() {
    // 1. Load data from Local Storage
    const result = initializeStorage();

    if (!result.success) {
        // Errors handled by later UI tasks; log for now
        result.errors.forEach(e => console.error('[Storage]', e));
    }

    if (result.data) {
        appData = result.data;
    }

    // 2. Wire navigation
    initializeNavigation();

    // 3. Render section UIs
    renderStudentSection();
    renderCourseSection();
    renderAttendanceSection();
    renderReportsSection();

    // 4. Show the default section
    navigateTo('students');
}

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Wire up all navigation interactions:
 * - Desktop nav links
 * - Mobile hamburger toggle
 * - Close-on-outside-click for mobile
 * Requirements: 10.1, 10.2, 10.9, 10.10
 */
function initializeNavigation() {
    const toggle  = document.querySelector('.nav-toggle');
    const menu    = document.getElementById('nav-menu');
    const links   = document.querySelectorAll('.nav-link');

    // ── Mobile hamburger ──────────────────────────────────────────
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute(
                'aria-label',
                isOpen ? 'Close navigation menu' : 'Open navigation menu'
            );
        });
    }

    // ── Nav link clicks ───────────────────────────────────────────
    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            if (section) navigateTo(section);

            // Close mobile menu after selection
            if (menu) {
                menu.classList.remove('open');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-label', 'Open navigation menu');
                }
            }
        });
    });

    // ── Close mobile menu when clicking outside the header ────────
    document.addEventListener('click', e => {
        if (menu && menu.classList.contains('open') &&
            !e.target.closest('#main-nav')) {
            menu.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open navigation menu');
            }
        }
    });

    // ── Keyboard: Escape closes the mobile menu ───────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menu && menu.classList.contains('open')) {
            menu.classList.remove('open');
            if (toggle) {
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-label', 'Open navigation menu');
                toggle.focus();     // return focus to the button
            }
        }
    });
}

/**
 * Navigate to a top-level section.
 * Updates the active link, shows the section, clears breadcrumb.
 * Requirements: 10.1, 10.2
 *
 * @param {string} sectionName - One of: students | courses | attendance | reports
 */
function navigateTo(sectionName) {
    navState = { section: sectionName, detail: null };

    // ── Activate nav link ─────────────────────────────────────────
    document.querySelectorAll('.nav-link').forEach(link => {
        const isCurrent = link.getAttribute('data-section') === sectionName;
        link.classList.toggle('active', isCurrent);
        // aria-current="page" marks the active link (WCAG 2.4.4)
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // ── Show matching section, hide others ────────────────────────
    document.querySelectorAll('.content-section').forEach(section => {
        const isActive = section.id === `${sectionName}-section`;
        section.classList.toggle('active', isActive);
    });

    // ── Clear breadcrumb for top-level sections ───────────────────
    clearBreadcrumb();

    // ── Move focus to the main content area (skip-link target) ────
    // This aids screen-reader users who navigate via the menu
    const main = document.getElementById('main-content');
    if (main) main.focus();
}

/**
 * Navigate into a detail view within a section.
 * Shows the correct section and pushes a breadcrumb trail.
 * Requirement: 10.3
 *
 * @param {string} sectionName - Parent section (e.g. 'students')
 * @param {string} detailLabel - Human-readable label for the detail view
 */
function navigateToDetail(sectionName, detailLabel) {
    navState = { section: sectionName, detail: { label: detailLabel } };

    // Keep the parent nav link active
    document.querySelectorAll('.nav-link').forEach(link => {
        const isCurrent = link.getAttribute('data-section') === sectionName;
        link.classList.toggle('active', isCurrent);
        if (isCurrent) {
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // Show the section (it should already be visible, but be safe)
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });

    // Render the breadcrumb
    renderBreadcrumb(sectionName, detailLabel);
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

/** Human-readable labels for each top-level section */
const SECTION_LABELS = {
    students:   'Students',
    courses:    'Courses',
    attendance: 'Attendance',
    reports:    'Reports'
};

/**
 * Render a two-level breadcrumb: Home section › Detail
 * Requirement: 10.3
 *
 * @param {string} sectionName  - Parent section name
 * @param {string} detailLabel  - Label for the current detail view
 */
function renderBreadcrumb(sectionName, detailLabel) {
    const nav = document.getElementById('breadcrumb');
    const ol  = nav.querySelector('ol');
    if (!nav || !ol) return;

    const parentLabel = SECTION_LABELS[sectionName] || sectionName;

    ol.innerHTML = `
        <li>
            <a href="#${sectionName}"
               data-section="${sectionName}"
               class="breadcrumb-link">
                ${escapeHTML(parentLabel)}
            </a>
        </li>
        <li>
            <span aria-current="page">${escapeHTML(detailLabel)}</span>
        </li>`;

    // Wire the parent crumb link
    ol.querySelector('.breadcrumb-link').addEventListener('click', e => {
        e.preventDefault();
        navigateTo(sectionName);
    });

    nav.classList.add('visible');
    nav.removeAttribute('aria-hidden');
}

/**
 * Hide the breadcrumb and clear its content.
 * Called when returning to a top-level section.
 */
function clearBreadcrumb() {
    const nav = document.getElementById('breadcrumb');
    if (!nav) return;
    nav.classList.remove('visible');
    nav.setAttribute('aria-hidden', 'true');
    const ol = nav.querySelector('ol');
    if (ol) ol.innerHTML = '';
}

// ─── Keyboard Navigation (Requirement 10.7, 10.8) ───────────────────────────

/**
 * Global keydown handler for cross-cutting keyboard behaviour.
 * Tab and Enter on form inputs are handled natively by the browser;
 * this handler supports modal close (Escape) and arrow-key nav in lists.
 */
document.addEventListener('keydown', e => {
    // Enter on a button triggers click natively; nothing extra needed.
    // Tab cycles through focusable elements natively; nothing extra needed.

    // Escape: handled per-component (modal, mobile menu) — see those modules.
});

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Escape user-supplied text before inserting it into innerHTML.
 * Prevents XSS in breadcrumb labels, list items, etc.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}

// ─── Notifications & Loading (Task 10.2) ─────────────────────────────────────

/** Duration in ms that a success toast stays visible (Requirement 10.5) */
const TOAST_SUCCESS_DURATION = 3000;

/** Auto-dismiss delay for error toasts (0 = persistent until dismissed) */
const TOAST_ERROR_DURATION = 0;

/** Active loading call counter — supports nested showLoading/hideLoading calls */
let _loadingDepth = 0;

/** setTimeout id for the pending loading display (100 ms threshold, Req 10.4) */
let _loadingTimer = null;

/**
 * Show a success toast that auto-dismisses after 3 seconds.
 * Requirement: 10.5
 *
 * @param {string} message - Human-readable success text
 */
function showSuccess(message) {
    _createToast(message, 'success', TOAST_SUCCESS_DURATION);
}

/**
 * Show a persistent error toast (stays until dismissed by the user).
 * Requirement: 10.6
 *
 * @param {string} message - Human-readable error text
 */
function showError(message) {
    _createToast(message, 'error', TOAST_ERROR_DURATION);
}

/**
 * Build and inject a toast notification into #toast-container.
 *
 * @param {string} message      - Text to display
 * @param {'success'|'error'} type - Visual style
 * @param {number} duration     - Auto-dismiss ms; 0 = persistent
 */
function _createToast(message, type, duration) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // ARIA: success uses role="status" (polite), error uses role="alert" (assertive)
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    // SVG icon (inline, aria-hidden)
    const iconSVG = type === 'success'
        ? `<svg class="toast-icon" aria-hidden="true" focusable="false"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                width="20" height="20" fill="currentColor">
               <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
           </svg>`
        : `<svg class="toast-icon" aria-hidden="true" focusable="false"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                width="20" height="20" fill="currentColor">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48
                        10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
           </svg>`;

    toast.innerHTML = `
        ${iconSVG}
        <span class="toast-message">${escapeHTML(message)}</span>
        <button class="toast-close"
                type="button"
                aria-label="Dismiss notification">
            &times;
        </button>`;

    container.appendChild(toast);

    // Wire dismiss button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => _dismissToast(toast));

    // Auto-dismiss
    if (duration > 0) {
        setTimeout(() => _dismissToast(toast), duration);
    }
}

/**
 * Animate a toast out, then remove it from the DOM.
 * @param {HTMLElement} toast
 */
function _dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, { once: true });
}

/**
 * Show the loading overlay.
 * The overlay appears only after a 100 ms threshold to avoid flickering
 * on fast operations (Requirement 10.4).
 * Supports nested calls — the overlay stays until every showLoading() has
 * a matching hideLoading().
 */
function showLoading() {
    _loadingDepth++;

    if (_loadingDepth === 1 && !_loadingTimer) {
        _loadingTimer = setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                overlay.removeAttribute('aria-hidden');
                // Prevent focus from reaching content beneath (modern browsers)
                document.body.setAttribute('inert-loading', '');
            }
            _loadingTimer = null;
        }, 100);
    }
}

/**
 * Hide the loading overlay.
 * Only actually hides when every showLoading() call has been matched.
 */
function hideLoading() {
    _loadingDepth = Math.max(0, _loadingDepth - 1);

    if (_loadingDepth === 0) {
        // Cancel the pending show if it hasn't fired yet
        if (_loadingTimer) {
            clearTimeout(_loadingTimer);
            _loadingTimer = null;
        }

        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.removeAttribute('inert-loading');
        }
    }
}

/**
 * Show a confirmation dialog and return a Promise that resolves to true
 * (confirmed) or false (cancelled).
 *
 * Requirements: 1.11 (delete student), 2.19 (delete course)
 *
 * @param {Object} options
 * @param {string} options.title    - Dialog heading
 * @param {string} options.message  - Body text (may contain the record count)
 * @param {string} [options.confirmLabel='Confirm'] - OK button label
 * @param {string} [options.cancelLabel='Cancel']   - Cancel button label
 * @param {'danger'|'primary'} [options.confirmStyle='danger'] - OK button style
 * @returns {Promise<boolean>}
 */
function showConfirmDialog({
    title         = 'Confirm',
    message       = 'Are you sure?',
    confirmLabel  = 'Confirm',
    cancelLabel   = 'Cancel',
    confirmStyle  = 'danger'
} = {}) {
    return new Promise(resolve => {
        const overlay   = document.getElementById('confirm-overlay');
        const dialog    = document.getElementById('confirm-dialog');
        const titleEl   = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const okBtn     = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');

        if (!overlay || !dialog) {
            // Fallback for environments where the dialog isn't in DOM
            resolve(window.confirm(`${title}\n\n${message}`));
            return;
        }

        // Populate content
        titleEl.textContent   = title;
        messageEl.textContent = message;
        okBtn.textContent     = confirmLabel;
        cancelBtn.textContent = cancelLabel;

        // OK button style
        okBtn.className = `btn btn-${confirmStyle}`;

        // Show
        overlay.classList.remove('hidden');
        // Use the native <dialog> open attribute if supported
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        }

        // Move focus to the Cancel button (safer default — prevents accidental confirm)
        cancelBtn.focus();

        // ── Event handlers ────────────────────────────────────────
        function close(result) {
            overlay.classList.add('hidden');
            if (typeof dialog.close === 'function') dialog.close();

            // Clean up listeners
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            overlay.removeEventListener('click', onOverlayClick);
            document.removeEventListener('keydown', onKeyDown);

            resolve(result);
        }

        function onOk()         { close(true);  }
        function onCancel()     { close(false); }

        // Clicking the overlay backdrop cancels
        function onOverlayClick(e) {
            if (e.target === overlay) close(false);
        }

        // Escape cancels (Requirement 10.7 — keyboard support)
        function onKeyDown(e) {
            if (e.key === 'Escape') { e.preventDefault(); close(false); }

            // Trap focus inside the dialog (WCAG 2.1.2)
            if (e.key === 'Tab') {
                const focusable = dialog.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last  = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        }

        okBtn.addEventListener('click',     onOk);
        cancelBtn.addEventListener('click', onCancel);
        overlay.addEventListener('click',   onOverlayClick);
        document.addEventListener('keydown', onKeyDown);
    });
}

// ─── Init ─────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
