🚀 Learning Management System (LMS) — [Ongoing Project]

> [!IMPORTANT]
> Project Status: Ongoing Development (In-Progress)
> This platform is currently under active development. Core features are functional, but we are continuously expanding capabilities, refining UI, and implementing the future roadmap.

A robust, full-stack Learning Management System built with Laravel 12 and React (Vite). This platform supports multiple user roles, including Students, Instructors, and Administrators, providing a seamless flow from course creation to student enrollment and progress tracking.

🌟 Features (Stable Iteration)

🎓 For Students
- Course Catalog: Browse and enroll in approved courses.
- Learning Materials: Access YouTube videos and PDF documents.
- Auto-Graded Quizzes: Take MCQs with instant scoring.
- Progress Tracking: Monitor completion % and quiz results.

👨‍🏫 For Instructors
- Course Builder: Create/manage courses and titles.
- Resource Management: Upload PDFs and add video links.
- Quiz Creator: Build MCQs with defined correct answers.
- Student Insights: Track enrollment and performance.

🛡️ For Administrators
- Approval System: Manage new courses and instructors.
- Student Control: Block/unblock users.
- Core Analytics: Overview of users, courses, and progress.

---

🛠️ Tech Stack

- Backend: Laravel 12 (PHP 8.2+), MySQL
- Frontend: React 18, Vite, Axios, React Router
- Security: Laravel Sanctum (Token-based Authentication), Role-based Middleware
- Asset Storage: local Laravel storage via storage:link

---

📅 Roadmap

Phase 4: Intermediate Features (Next Steps)
- [ ] Real-time Notifications: WebSocker/Pusher integration for course approvals and new student enrollments.
- [ ] Certificate Generation: Automated generation of PDF certificates upon 100% course completion.
- [ ] Advanced Analytics: Detailed charts and graphs for instructors to track student dropout rates and material popularity.

Phase 5: Monetization & Community
- [ ] Stripe Integration: Support for paid courses and secure checkout flow.
- [ ] Direct Messaging: Secure chat system between students and instructors.
- [ ] Forum/Discussion Boards: Per-course community sections for collaborative learning.

Phase 6: Expansion
- [ ] Mobile Application: Dedicated Android/iOS apps for mobile-first learning.
- [ ] Offline Mode: Capability to download PDFs for offline viewing.

---

🏁 Getting Started

Prerequisites
- PHP 8.2+
- Node.js & NPM
- MySQL

Step 1: Backend Setup
```bash
cd backend
composer install
cp .env.example .env # Configure your database details
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve --port=8000
```

Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173 to start learning!
