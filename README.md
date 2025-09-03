
# Studio

## Description
Studio is a web application for managing radio/TV program reservations, user roles (admin, producer, engineer), and weekly schedules. It features user authentication, profile management, dynamic form creation, AI-assisted validation, and data management for programs, users, and reservations. The platform is designed for broadcast studios to streamline scheduling, resource allocation, and administrative workflows.

## Features
- User authentication (login, change password)
- User profile management (edit profile, profile picture upload)
- Admin dashboard for managing users, programs, and reservations
- Producer and engineer role-based dashboards
- Dynamic form creation and management (with AI-assisted validation)
- Reservation management (create, edit, view, and export reservations)
- Program name management
- Weekly schedule calendar view
- Theming (light/dark mode)
- File upload for profile pictures (AWS S3 integration)

## Installation
To set up the project locally:

1. **Clone the repository:**
    ```bash
    git clone [repository-url]
    cd studio
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up environment variables:**
    Create a `.env.local` file in the root directory and add the required environment variables (e.g., database connection strings, Genkit/Google AI API keys, AWS S3 credentials).

4. **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:9002`.

5. **Run Genkit development server (for AI features):**
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit server for AI-assisted form and validation features.

## Usage
- Open `http://localhost:9002` in your browser.
- Log in as an admin, producer, or engineer to access role-specific features.
- Use the dashboard to manage users, programs, and reservations.
- Create and manage forms with AI-assisted validation.
- View and export weekly schedules.

## Technologies Used
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI (Radix UI-based)
- **State/Data:** React Query, local JSON (for demo), Firebase (if configured)
- **Form Handling:** React Hook Form, Zod
- **Authentication:** bcryptjs, js-cookie
- **AI Integration:** Genkit AI, Google AI
- **Cloud Storage:** AWS S3 (profile picture uploads)
- **Date Handling:** date-fns, date-fns-jalali
- **Charting:** Recharts
- **UI Components:** Radix UI, Shadcn UI
- **Utilities:** clsx, tailwind-merge, lucide-react

## Contributing
Contributions are welcome! Please fork the repository, create a feature branch, make your changes, and submit a pull request.

## License
MIT License
