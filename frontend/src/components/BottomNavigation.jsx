import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, Globe2, Award, Users } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", icon: Home, testId: "nav-home" },
  { to: "/lessons", label: "Lessons", icon: BookOpen, testId: "nav-lessons" },
  { to: "/global", label: "Missions", icon: Globe2, testId: "nav-missions" },
  { to: "/progress", label: "Progress", icon: Award, testId: "nav-progress" },
  { to: "/parent", label: "Parent", icon: Users, testId: "nav-parent" },
];

export default function BottomNavigation() {
  return (
    <nav
      className="cck-bottomnav fixed bottom-0 left-0 right-0 z-40"
      data-testid="bottom-navigation"
    >
      <div className="max-w-[1200px] mx-auto px-2 py-2 grid grid-cols-5 gap-1">
        {items.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={testId}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[rgba(28,124,125,0.10)] text-[var(--cck-teal-deep)]"
                  : "text-[var(--cck-navy-soft)] hover:text-[var(--cck-teal-deep)]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className="transition-transform duration-300"
                  style={{ transform: isActive ? "translateY(-1px)" : "none" }}
                />
                <span
                  className="mt-1 text-[10.5px] font-semibold tracking-wide"
                  style={{ fontFamily: "var(--font-ui)" }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
