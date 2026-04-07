import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import PrivateRoute from "./routes/PrivateRoute"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Modelos from "./pages/Modelos"
import Contratos from "./pages/Contratos"
import Contrato from "./pages/Contrato"
import Usuarios from "./pages/usuarios/Usuarios"
import Roles from "./pages/roles/Roles"
import Repactuacoes from "./pages/Repactuacoes"
import Profile from "./pages/Profile"

function App() {
  return (
    <AuthProvider>

      <BrowserRouter>

        <Routes>

          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/modelos"
            element={
              <PrivateRoute>
                <Modelos />
              </PrivateRoute>
            }
          />

          {/* LISTA DE CONTRATOS */}
          <Route
            path="/contratos"
            element={
              <PrivateRoute>
                <Contratos />
              </PrivateRoute>
            }
          />

          {/* CONTRATO ESPECÍFICO */}
          <Route
            path="/contratos/:id"
            element={
              <PrivateRoute>
                <Contrato />
              </PrivateRoute>
            }
          />
          {/* USUÁRIOS */}
          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <Usuarios />
              </PrivateRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <PrivateRoute>
                <Roles />
              </PrivateRoute>
            }
          />
          <Route
            path="/repactuacoes"
            element={
              <PrivateRoute>
                <Repactuacoes />
              </PrivateRoute>
            }
          />

        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "10px",
              background: "#fff",
              color: "#1e293b",
              border: "1px solid #e2e8f0",
            },
          }}
        />

      </BrowserRouter>

    </AuthProvider>
  )
}

export default App