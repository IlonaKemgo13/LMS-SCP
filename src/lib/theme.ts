// Central color definitions for the entire LMS-SCP app.
// Edit this file to retheme the entire application.

export const theme = {
  primary: {
    50:  "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1",
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },

  neutral: {
    50:  "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },

  success: { main: "#10b981", light: "#d1fae5" },
  warning: { main: "#f59e0b", light: "#fef3c7" },
  danger:  { main: "#ef4444", light: "#fee2e2" },
  info:    { main: "#3b82f6", light: "#dbeafe" },

  roles: {
    admin: {
      sidebarBg:   "#020617", // slate-950
      sidebarText: "#cbd5e1", // slate-300
      heroFrom:    "#0f172a", // slate-900
      heroVia:     "#1e1b4b", // indigo-900
      heroTo:      "#3b0764", // purple-900
      badgeBg:     "#fff1f2",
      badgeText:   "#be123c",
      accent:      "#7c3aed", // violet-700
      lightBg:     "#f5f3ff", // violet-50
    },
    teacher: {
      sidebarBg:   "#0f172a", // slate-900
      sidebarText: "#e2e8f0", // slate-200
      heroFrom:    "#4f46e5", // indigo-600
      heroVia:     "#9333ea", // purple-600
      heroTo:      "#c026d3", // fuchsia-600
      badgeBg:     "#f5f3ff",
      badgeText:   "#6d28d9",
      accent:      "#4f46e5", // indigo-600
      lightBg:     "#eef2ff", // indigo-50
    },
    student: {
      sidebarBg:   "#020617", // slate-950
      sidebarText: "#cbd5e1", // slate-300
      heroFrom:    "#1d4ed8", // blue-700
      heroVia:     "#1d4ed8", // blue-700
      heroTo:      "#7e22ce", // purple-700
      badgeBg:     "#eff6ff",
      badgeText:   "#1d4ed8",
      accent:      "#2563eb", // blue-600
      lightBg:     "#eff6ff", // blue-50
    },
    parent: {
      sidebarBg:   "#020617", // slate-950
      sidebarText: "#cbd5e1", // slate-300
      heroFrom:    "#2563eb", // blue-600
      heroVia:     "#4f46e5", // indigo-600
      heroTo:      "#9333ea", // purple-600
      badgeBg:     "#eff6ff",
      badgeText:   "#1d4ed8",
      accent:      "#2563eb", // blue-600
      lightBg:     "#eff6ff", // blue-50
    },
  },

  bg: {
    page:    "#f1f5f9", // slate-100
    card:    "#ffffff",
    overlay: "rgba(0,0,0,0.5)",
    input:   "#f8fafc", // slate-50
  },

  text: {
    primary:   "#0f172a", // slate-900
    secondary: "#475569", // slate-600
    muted:     "#94a3b8", // slate-400
    inverse:   "#ffffff",
  },

  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },

  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "1rem",
    full: "9999px",
  },

  spacing: {
    sidebar: "16rem",   // 256px / w-64
    topbar:  "4rem",    // 64px  / h-16
  },
} as const

export type Theme = typeof theme
