import React from "react";
import { Outlet } from "react-router-dom";
import SidebarHospital from "./SidebarHospital";

export default function AdminHospitalDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarHospital />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
