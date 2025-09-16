function RequireAdminHospital({ children }: { children?: React.ReactNode }) {
  const isAuth = localStorage.getItem("moyo-auth") === "true";
  const userPerfil = localStorage.getItem("moyo-perfil");
  const location = useLocation();
  if (!isAuth || userPerfil !== "adminhospital") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
import React from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./features/dashboard/Dashboard";
import PerfilProfissional from "./features/dashboard/PerfilProfissional";
import Exames from "./features/dashboard/Exames";
import Relatorios from "./features/dashboard/Relatorios";
import Notificacoes from "./features/dashboard/Notificacoes";
import Pacientes from "./features/pacientes/Pacientes";
import Consultas from "./features/consultas/Consultas";
import Login from "./features/auth/Login";
import LandingPage from "./features/LandingPage";
import Signup from "./features/auth/Signup";
import { Routes, Route, useLocation, Navigate, Outlet } from "react-router-dom";
import PacienteDashboard from "./features/paciente/PacienteDashboard";
import AdminDashboard from "./features/DasboardAdmin/AdminDashboard";
<<<<<<< HEAD
import AdminHospitalProfile from "./features/adminDashboardhospital/DashboardAdminHospital";
import ProfissionaisAdmin from "./features/adminDashboardhospital/ProfissionaisAdmin";

=======
>>>>>>> cf88536afe7e14b64ba0d90336c657939ec9024f

function RequireAuth({ perfil }: { children?: React.ReactNode; perfil: string }) {
  const isAuth = localStorage.getItem("moyo-auth") === "true";
  const userPerfil = localStorage.getItem("moyo-perfil");
  const location = useLocation();
  if (!isAuth || userPerfil !== perfil) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuth = localStorage.getItem("moyo-auth") === "true";
  if (isAuth) {
    const perfil = localStorage.getItem("moyo-perfil");
    return <Navigate to={perfil === "paciente" ? "/paciente" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function ProfissionalLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PacienteLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<RequireGuest><LandingPage /></RequireGuest>} />
      {/* Rotas do Profissional */}
      <Route element={<RequireAuth perfil="profissional" />}> 
        <Route element={<ProfissionalLayout />}>
         
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/perfil" element={<PerfilProfissional />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="consultas" element={<Consultas />} />
          <Route path="exames" element={<Exames />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="notificacoes" element={<Notificacoes />} />
        </Route>
      </Route>
      {/* Rotas do Paciente */}
      <Route path="/paciente" element={<RequireAuth perfil="paciente" />}> 
        <Route element={<PacienteLayout />}> 
          <Route index element={<PacienteDashboard />} />
        </Route>
      </Route>
      <Route path="/admin" element={<AdminDashboard />} />
<<<<<<< HEAD
      <Route path="/adminhospitaldashboard" element={<AdminHospitalProfile />} />
      <Route path="/ProfissionaisAdmin" element={<ProfissionaisAdmin />} />
      <Route path="/admin/profissionais" element={<ProfissionaisAdmin />} />
=======
>>>>>>> cf88536afe7e14b64ba0d90336c657939ec9024f
    </Routes>
  );
}
export default App;
