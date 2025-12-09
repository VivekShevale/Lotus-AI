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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<ModelsPage />} />
        {/* <Route path="models/linear-regression" element={<ModelTraining />} /> */}
        <Route path="models/all" element={<ModelsPage />} />
        <Route path="models/:slug" element={<ModelTraining />} />
        <Route path="neural" element={<Neural />} />
        <Route path="data/upload" element={<DataUpload />} />
        <Route path="*" element={<NotFoundPageMinimal />} />
      </Route>
    </Routes>
  );
}

export default App;