import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ParentPage from "./pages/ParentPage";
import Layout from "./pages/Layout";
import ModelsPage from "./pages/Models";
import ModelTraining from "./pages/ModelTraining";
import UploadPage from "./pages/DataUpload";
import Neural from "./pages/Neural";
import NotFoundPageMinimal from "./pages/NotFound";
import DataUpload from "./pages/DataUpload";
import Workflow from "./pages/Workflow";
import AuthPage from "./pages/AuthPage";
import DatasetAnalyzer from "./components/DataAnalyzer";
import ResumeAnalyzer from "./pages/Resume";
import HomePage from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/" element={<Layout />}>
        <Route path="home" element={<HomePage />} />
        <Route path="dashboard" element={<ModelsPage />} />
        {/* <Route path="models/linear-regression" element={<ModelTraining />} /> */}
        <Route path="models/all" element={<ModelsPage />} />
        <Route path="models/:slug" element={<ModelTraining />} />
        <Route path="neural" element={<Neural />} />
        <Route path="data/upload" element={<DataUpload />} />
        <Route path="*" element={<NotFoundPageMinimal />} />
        <Route path="/analyze" element={<DatasetAnalyzer />} />
        <Route path="/resume" element={<ResumeAnalyzer />} />
        <Route path="/models/create-flow" element={<Workflow />} />
      </Route>
      <Route path="/auth" element={<AuthPage />} />
    </Routes>
  );
}

export default App;