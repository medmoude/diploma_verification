import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";

import Dashboard from "./pages/Dashboard";
import Etudiants from "./pages/Etudiants";
import Diplomes from "./pages/Diplomes";
import Verifications from "./pages/Verifications";
import Parametres from "./pages/Parametres";
import Verify from "./pages/Verify";
import Filieres from "./pages/Filieres";
import Annees from "./pages/Annees";
import StructureDiplome from "./pages/StructureDiplome";
import VerifyFile from "./pages/VerifyFile";
import VerificationLayout from "./components/Layout/VerificationLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify/:verification_uuid" element={<Verify />} />
        <Route path="/" element={<VerificationLayout />} />
        <Route path="/verify-file" element={<VerifyFile />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><Dashboard /></PrivateRoute>}
        />

        <Route
          path="/etudiants"
          element={<PrivateRoute><Etudiants /></PrivateRoute>}
        />

        <Route
          path="/diplomes"
          element={<PrivateRoute><Diplomes /></PrivateRoute>}
        />

        <Route
          path="/verifications"
          element={<PrivateRoute><Verifications /></PrivateRoute>}
        />

        <Route
          path="/filieres"
          element={<PrivateRoute><Filieres /></PrivateRoute>}
        />

        <Route
          path="/annees_universitaires"
          element={<PrivateRoute><Annees /></PrivateRoute>}
        />

        <Route
          path="structure-diplome"
          element={
            <PrivateRoute>
              <StructureDiplome />
            </PrivateRoute>
          }
        />

        <Route
          path="/parametres"
          element={<PrivateRoute><Parametres /></PrivateRoute>}
        />

      </Routes>

    </Router>
  );
}

export default App;
