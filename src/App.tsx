import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { useReminders } from "./hooks/useReminders";
import ProjectListPage from "./pages/ProjectListPage";
import NewProjectPage from "./pages/NewProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import EditProjectPage from "./pages/EditProjectPage";
import PatternLibraryPage from "./pages/PatternLibraryPage";
import StatisticsPage from "./pages/StatisticsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  useReminders();
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<EditProjectPage />} />
        <Route path="/library" element={<PatternLibraryPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}
