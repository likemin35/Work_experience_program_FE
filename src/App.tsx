import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import GlobalHeader from "./components/GlobalHeader";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import CampaignCreationPage from "./pages/CampaignCreationPage";
import CampaignListPage from "./pages/CampaignListPage";
import CampaignSegmentResultPage from "./pages/CampaignSegmentResultPage";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import MessageEditPage from "./pages/MessageEditPage";
import MessageResultPage from "./pages/MessageResultPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalHeader />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/promotion/create"
              element={
                <ProtectedRoute>
                  <CampaignCreationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaign/:campaignId/segments"
              element={
                <ProtectedRoute>
                  <CampaignSegmentResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaign/:campaignId"
              element={
                <ProtectedRoute>
                  <MessageResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns"
              element={
                <ProtectedRoute>
                  <CampaignListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaign/:campaignId/messages/:resultId/edit"
              element={
                <ProtectedRoute>
                  <MessageEditPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
