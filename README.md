# Student Attendance Manager

A web-based attendance management system designed to help educational institutions manage students, courses, enrollments, attendance records, and attendance analytics.

The application provides attendance tracking, reporting, and automatic identification of at-risk students through an intuitive and responsive user interface.

---

## Features

### Student Management

* Add new students
* Edit student information
* Delete students
* Validate student data
* Search students by name or ID
* Filter at-risk students
* View detailed student information

### Course Management

* Create courses
* Edit course details
* Delete courses
* Enforce unique course codes
* View course information

### Enrollment Management

* Enroll students in courses
* Remove students from courses
* View enrolled students
* Prevent duplicate enrollments

### Attendance Management

* Record attendance by course and date
* Mark students as Present or Absent
* Bulk attendance actions
* Load existing attendance records
* Edit attendance history

### Attendance History

* View attendance history by student
* View attendance history by course
* Edit attendance records directly from history views

### Reporting

* Course Summary Reports
* Student Summary Reports
* At-Risk Student Reports
* Attendance Statistics
* Absence Rate Calculations

### At-Risk Detection

Students are automatically marked as at-risk when their absence rate reaches or exceeds **30%** in a course.

The system provides:

* Visual warning indicators
* At-risk filtering
* Dedicated at-risk reports

---

## Technology Stack

| Technology       | Purpose                       |
| ---------------- | ----------------------------- |
| HTML5            | Structure and layout          |
| CSS3             | Styling and responsive design |
| JavaScript (ES6) | Application logic             |
| Local Storage    | Data persistence              |

---

## Project Structure

```text
StudentAttendanceManager/
│
├── index.html
├── styles.css
├── app.js
│
├── storage.js
├── utils.js
├── models.js
│
├── studentModule.js
├── courseModule.js
├── attendanceModule.js
├── reportModule.js
│
├── studentUI.js
├── courseUI.js
├── enrollmentUI.js
├── attendanceUI.js
├── historyUI.js
└── reportsUI.js
```

---

## Installation

### Clone the Repository

```bash
git clone <repository-url>
```

### Navigate to the Project Directory

```bash
cd StudentAttendanceManager
```

### Start a Local Development Server

```bash
python -m http.server 8080
```

### Open the Application

Open your browser and visit:

```text
http://localhost:8080
```

---

## Usage

### 1. Student Setup

* Create student records
* Verify student information

### 2. Course Setup

* Create courses
* Define course details

### 3. Enrollment

* Enroll students into courses
* Manage course rosters

### 4. Attendance Tracking

* Select a course and date
* Record attendance
* Save attendance records

### 5. Monitoring

* Review attendance history
* Monitor absence rates
* Identify at-risk students

### 6. Reporting

* Generate course reports
* Generate student reports
* Review at-risk reports

---

## Data Persistence

The application uses **Browser Local Storage** for data persistence.

Stored data includes:

* Students
* Courses
* Enrollments
* Attendance Records

No external database or backend server is required.

---

## Accessibility Features

The application includes several accessibility enhancements:

* Keyboard navigation support
* Focus management
* ARIA labels and roles
* Accessible dialogs
* Screen-reader friendly controls
* Reduced-motion support
* High-contrast support
* Responsive layouts for mobile devices

---

## Responsive Design

The application is optimized for:

* Desktop computers
* Tablets
* Mobile devices

Responsive features include:

* Collapsible navigation menu
* Mobile-friendly forms
* Responsive tables
* Touch-friendly controls
* Adaptive layouts

---

## Key Business Rules

### Student Rules

* Student ID must be unique
* Student ID cannot be modified after creation

### Course Rules

* Course Code must be unique
* Course Code cannot be modified after creation

### Attendance Rules

* Future attendance dates are not allowed
* Every enrolled student must be marked before saving

### At-Risk Rules

* Students become at-risk at **30.0% absence rate**
* At-risk status is automatically recalculated after attendance updates

---

## Project Status

**Status:** Completed

Implemented modules:

* Student Management
* Course Management
* Enrollment Management
* Attendance Management
* Attendance History
* Reporting System
* At-Risk Monitoring
* Responsive UI
* Accessibility Support

---

## Author

### Jovani Bou Khalil

Computer Engineering Student

This project was developed as an academic software engineering project to demonstrate:

* Data modeling
* Frontend architecture
* Attendance management workflows
* Reporting systems
* Accessibility best practices
* Responsive web design

GitHub: https://github.com/JovaniBouKhalil
