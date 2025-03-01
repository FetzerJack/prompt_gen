# PromptGen

PromptGen is a dynamic prompt editor application built with Next.js. It allows users to create, edit, and manage prompt details—including titles, objectives, instructions, and custom sections—while generating a structured XML output for further processing. The project is bootstrapped with [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and is designed for a smooth, responsive user experience.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [License](#license)

---

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/FetzerJack/prompt_gen.git
cd prompt_gen
```

Install the dependencies using Yarn:

```bash
yarn install
```

To start the development server, run:

```bash
yarn dev
```

Open http://localhost:3000 in your browser to see the application in action.

---

## Features
- **Prompt Editing**: Modify prompt titles, objectives, instructions, and custom sections with ease.
- **Inline Editing**: Toggle between view and edit modes for a seamless editing experience.
- **Custom Sections**: Add, edit, and delete custom sections, with support for both plain text and list items.
- **XML Generation**: Generate an XML representation of the prompt, fully wrapped in <prompt> tags.
- **User-Friendly Interface**: Clean, responsive design built with modern UI practices and Tailwind CSS.
- **Easy Duplication**: Quickly duplicate existing prompts for creating variations or backups.

---

## Project Structure

* /app
    + Contains the Next.js application code.
* /components
	+ PromptEditor.js - Main component for editing prompt details.
	+ Modal.js - A reusable modal component.
* /pages/api
    + API routes to perform CRUD operations with the backend (using Prisma if applicable).
* /prisma
    + Prisma schema and migration files for database management.

---

## Technologies Used
* Next.js: React framework for building server-rendered applications.
* React: UI library for building interactive user interfaces.
* Tailwind CSS: Utility-first CSS framework for fast and consistent UI styling.
* Prisma: ORM (if used) for interacting with your database.
* Yarn: Dependency management and script runner.
* Node.js: JavaScript runtime environment.

---

## License

This project is licensed under the MIT License.

---


## Happy prompting with PromptGen!
