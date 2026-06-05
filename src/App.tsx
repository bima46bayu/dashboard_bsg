import { Route, Routes } from "react-router-dom";
import PageShell from "@/components/layout/PageShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PartnersProvider } from "@/context/PartnersContext";
import { ProjectsProvider } from "@/context/ProjectsContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import SalesPage from "@/pages/SalesPage";
import InventoryPage from "@/pages/InventoryPage";
import ProjectPage from "@/pages/ProjectPage";
import ProfitabilityPage from "@/pages/ProfitabilityPage";
import AssetPage from "@/pages/AssetPage";
import DocumentPage from "@/pages/DocumentPage";
import MarketingPage from "@/pages/MarketingPage";
import WhatsAppPromoPage from "@/pages/WhatsAppPromoPage";
import ReportingPage from "@/pages/ReportingPage";
import MonitoringLayout from "@/components/layout/MonitoringLayout";
import MonitoringProjectsPage from "@/pages/monitoring/MonitoringProjectsPage";
import MonitoringNewProjectPage from "@/pages/monitoring/MonitoringNewProjectPage";
import MonitoringMasterDataPage from "@/pages/monitoring/MonitoringMasterDataPage";
import MonitoringMasterItemPage from "@/pages/monitoring/MonitoringMasterItemPage";
import MonitoringMasterIndirectCostPage from "@/pages/monitoring/MonitoringMasterIndirectCostPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <PartnersProvider>
              <ProjectsProvider>
                <Routes>
                  <Route path="/project/monitoring" element={<MonitoringLayout />}>
                    <Route index element={<MonitoringProjectsPage />} />
                    <Route path="new" element={<MonitoringNewProjectPage />} />
                    <Route path="master" element={<MonitoringMasterDataPage />} />
                    <Route
                      path="master/items"
                      element={<MonitoringMasterItemPage />}
                    />
                    <Route
                      path="master/indirect-cost"
                      element={<MonitoringMasterIndirectCostPage />}
                    />
                  </Route>

                  <Route
                    path="/*"
                    element={
                      <PageShell>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          <Route path="/sales" element={<SalesPage />} />
                          <Route path="/inventory" element={<InventoryPage />} />
                          <Route path="/project" element={<ProjectPage />} />
                          <Route
                            path="/profitability"
                            element={<ProfitabilityPage />}
                          />
                          <Route path="/asset" element={<AssetPage />} />
                          <Route path="/document" element={<DocumentPage />} />
                          <Route path="/marketing" element={<MarketingPage />} />
                          <Route
                            path="/marketing/whatsapp"
                            element={<WhatsAppPromoPage />}
                          />
                          <Route path="/reporting" element={<ReportingPage />} />
                        </Routes>
                      </PageShell>
                    }
                  />
                </Routes>
              </ProjectsProvider>
            </PartnersProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
