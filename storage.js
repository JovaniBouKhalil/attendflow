/**
 * Storage Layer
 * Manages Local Storage operations for the Student Attendance Manager
 * Requirement 8: Local Data Persistence
 */

const STORAGE_KEY = 'studentAttendanceManager';

/**
 * Initialize the storage layer
 * Loads data from Local Storage or initializes empty data structures
 * @returns {Object} Result object with success status, data, and errors
 * Requirements: 8.4, 8.5, 8.6, 8.7, 8.8, 8.12
 */
function initializeStorage() {
    try {
        // Check if Local Storage is available
        if (typeof Storage === 'undefined') {
            return {
                success: false,
                data: null,
                errors: ['Local Storage is not supported by this browser. Please use a modern browser.']
            };
        }

        const result = loadData();
        
        if (!result.success) {
            // If load failed, initialize with empty data structures
            console.warn('Failed to load data from Local Storage. Initializing with empty data structures.');
            const emptyData = getEmptyDataStructure();
            const saveResult = saveData(emptyData);
            
            if (saveResult.success) {
                return {
                    success: true,
                    data: emptyData,
                    errors: []
                };
            } else {
                return {
                    success: false,
                    data: emptyData,
                    errors: result.errors.concat(saveResult.errors)
                };
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('Storage initialization error:', error);
        return {
            success: false,
            data: getEmptyDataStructure(),
            errors: ['Failed to initialize storage: ' + error.message]
        };
    }
}

/**
 * Save data to Local Storage
 * @param {Object} data - Data object to save
 * @returns {Object} Result object with success status and errors
 * Requirements: 8.1, 8.2, 8.3, 8.6, 8.9, 8.10, 8.11
 */
function saveData(data) {
    try {
        // Validate data structure
        if (!isValidDataStructure(data)) {
            return {
                success: false,
                errors: ['Invalid data structure. Cannot save to Local Storage.']
            };
        }

        // Serialize data to JSON
        const jsonData = JSON.stringify(data);
        
        // Save to Local Storage
        localStorage.setItem(STORAGE_KEY, jsonData);
        
        return {
            success: true,
            errors: []
        };
        
    } catch (error) {
        console.error('Storage save error:', error);
        
        // Check if quota exceeded
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            return {
                success: false,
                errors: ['Storage is full. Please delete old records to free up space.']
            };
        }
        
        // Generic write failure
        return {
            success: false,
            errors: ['Failed to save data. Changes may be lost. Error: ' + error.message]
        };
    }
}

/**
 * Load data from Local Storage
 * @returns {Object} Result object with success status, data, and errors
 * Requirements: 8.4, 8.5, 8.7, 8.8, 8.12
 */
function loadData() {
    try {
        // Retrieve data from Local Storage
        const jsonData = localStorage.getItem(STORAGE_KEY);
        
        // If no data exists, return empty data structure
        if (jsonData === null || jsonData === undefined) {
            return {
                success: true,
                data: getEmptyDataStructure(),
                errors: []
            };
        }
        
        // Deserialize JSON data
        let data;
        try {
            data = JSON.parse(jsonData);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return {
                success: false,
                data: getEmptyDataStructure(),
                errors: ['Data corrupted. Initializing fresh start. (JSON parsing failed)']
            };
        }
        
        // Validate data structure
        if (!isValidDataStructure(data)) {
            console.error('Invalid data structure in Local Storage');
            return {
                success: false,
                data: getEmptyDataStructure(),
                errors: ['Invalid data format. Initializing fresh start. (Missing required fields)']
            };
        }
        
        return {
            success: true,
            data: data,
            errors: []
        };
        
    } catch (error) {
        console.error('Storage load error:', error);
        return {
            success: false,
            data: getEmptyDataStructure(),
            errors: ['Cannot access local storage. Check browser settings. Error: ' + error.message]
        };
    }
}

/**
 * Get empty data structure
 * Used for initialization when Local Storage is empty or corrupted
 * @returns {Object} Empty data structure
 * Requirement: 8.5
 */
function getEmptyDataStructure() {
    return {
        students: [],
        courses: [],
        attendanceRecords: [],
        enrollments: []
    };
}

/**
 * Validate data structure
 * Checks if the data object has all required fields
 * @param {Object} data - Data object to validate
 * @returns {boolean} True if valid, false otherwise
 * Requirement: 8.8
 */
function isValidDataStructure(data) {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    // Check for required fields
    const requiredFields = ['students', 'courses', 'attendanceRecords', 'enrollments'];
    
    for (const field of requiredFields) {
        if (!Array.isArray(data[field])) {
            return false;
        }
    }
    
    return true;
}

/**
 * Clear all data from Local Storage
 * Used for testing or data reset purposes
 * @returns {Object} Result object with success status and errors
 */
function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return {
            success: true,
            errors: []
        };
    } catch (error) {
        console.error('Storage clear error:', error);
        return {
            success: false,
            errors: ['Failed to clear storage: ' + error.message]
        };
    }
}

/**
 * Get storage usage information
 * Provides information about current storage usage
 * @returns {Object} Storage usage info
 */
function getStorageInfo() {
    try {
        const jsonData = localStorage.getItem(STORAGE_KEY);
        const sizeInBytes = jsonData ? new Blob([jsonData]).size : 0;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        
        return {
            sizeInBytes: sizeInBytes,
            sizeInKB: sizeInKB,
            key: STORAGE_KEY
        };
    } catch (error) {
        console.error('Storage info error:', error);
        return {
            sizeInBytes: 0,
            sizeInKB: '0.00',
            key: STORAGE_KEY
        };
    }
}
