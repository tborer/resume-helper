# Codev Template

This project is a web application template built with modern technologies to provide a robust and efficient development experience. It includes:

1. Next.js with Pages Router
2. Tailwind CSS Framework
3. React Context for global state management
4. TypeScript for enhanced code quality and maintainability
5. Prisma for database interactions

## Features

- **Next.js Pages Router**: Utilizes the traditional routing system of Next.js for easy navigation and page management.
- **Tailwind CSS**: A utility-first CSS framework that provides low-level utility classes to build custom designs quickly and efficiently.
- **React Context API**: Implements React's Context API for efficient global state management.
- **TypeScript**: Employs TypeScript for static typing, improving code readability and reducing errors.
- **Prisma**: Integrates Prisma as an ORM for streamlined database interactions.
- **User Authentication**: Implements user authentication, likely using magic links for passwordless login.
- **Subscription Management**: Handles user subscriptions and related functionality.
- **Resume Analysis**: Provides features for analyzing and potentially optimizing resumes.
- **Gemini API Integration**: Integrates with the Gemini API for AI-powered features (e.g., resume analysis).

## Getting Started

1. Clone this repository
2. Install dependencies:


npm install

3. Run the development server:


npm run dev

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `pages/`: Contains the application's pages and API routes. This directory handles routing and server-side logic.
- `components/`: Houses reusable React components used throughout the application.
- `contexts/`: Manages global application state using React Context, providing a centralized state management solution.
- `hooks/`: Includes custom React hooks for encapsulating and reusing logic across components.
- `lib/`: Contains library files for integrating external services (like the Gemini API), managing database interactions with Prisma, and providing utility functions.
- `styles/`: Contains global styles (global.css) for consistent application-wide styling.
- `utils/`: Provides utility functions and helpers for various tasks.
- `prisma/`: Defines the database schema using Prisma's schema definition language.
- `public/`: Contains static assets such as images and favicons.
- `.vscode/`: Includes VS Code specific settings for the project, such as recommended extensions and code formatting rules.

## Learn More

To learn more about the technologies used in this template, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Context API](https://reactjs.org/docs/context.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

