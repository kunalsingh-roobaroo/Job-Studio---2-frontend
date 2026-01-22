# Resume Ready Rocket Frontend

A modern, beautifully designed React application with a responsive layout and elegant UI. Built with the latest technologies for an exceptional user experience.

## ✨ Features

- 🌓 **Dark Mode Support** - Seamless theme switching with smooth transitions
- 📱 **Fully Responsive** - Mobile-first design with adaptive sidebar and navigation
- ⚡ **Blazing Fast** - Powered by Vite for lightning-quick development and builds
- 🎨 **Beautiful Gradients** - Eye-catching gradient backgrounds and text effects
- 🧩 **Component Library** - Reusable components built on shadcn/ui

## 🛠️ Tech Stack

- **React 19** - Latest version with improved performance
- **TypeScript** - Type-safe development
- **Vite 7** - Next-generation frontend tooling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component system
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd resume-ready-rocket-frontend

# Install dependencies
npm install
```

## 🚀 Getting Started

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🏗️ Project Structure

```
resume-ready-rocket-frontend/
├── src/
│   ├── components/
│   │   ├── sidebar/         # Sidebar navigation components
│   │   │   ├── nav-main.tsx
│   │   │   ├── nav-projects.tsx
│   │   │   └── nav-user.tsx
│   │   ├── ui/              # shadcn/ui components
│   │   ├── app-sidebar.tsx  # Main sidebar component
│   │   └── MobileHeader.tsx # Mobile navigation
│   ├── contexts/
│   │   └── ThemeContext.tsx # Theme management
│   ├── hooks/
│   │   └── use-mobile.ts    # Mobile detection hook
│   ├── pages/
│   │   └── Home.tsx         # Home page
│   ├── App.tsx              # Main app component
│   └── main.tsx             # App entry point
├── public/                  # Static assets
└── package.json
```

## 🌓 Theme Support

The application includes a comprehensive theme system with automatic dark mode detection and manual toggle capability. Theme preferences are persisted across sessions.

## 📱 Responsive Design

- **Desktop**: Full sidebar with rich navigation
- **Tablet**: Collapsible sidebar with optimized spacing
- **Mobile**: Bottom sheet navigation with mobile-optimized header

## 🔧 Configuration

- **Vite Config**: `vite.config.ts`
- **TypeScript Config**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- **Tailwind Config**: Tailwind CSS v4 with custom glass utilities
- **ESLint Config**: `eslint.config.js`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the excellent component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first framework

---

