import React from "react";
import { NavLink } from "react-router-dom";

const menu = [
  { to: "/adminhospital", label: "Home" },
  { to: "/adminhospital/profissionais", label: "Profissionais" },
  { to: "/adminhospital/especialidades", label: "Especialidades" },
  { to: "/adminhospital/exames", label: "Exames" },
  { to: "/adminhospital/horarios", label: "Horários" },
  { to: "/adminhospital/configuracoes", label: "Configurações" },
];

export default function SidebarHospital() {
  return (
    <aside className="w-64 bg-white shadow-lg h-full p-4">
      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${isActive ? "bg-blue-100 text-blue-700 font-bold" : "hover:bg-gray-100"}`
            }
            end
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
