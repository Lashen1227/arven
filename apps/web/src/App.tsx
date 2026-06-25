import { Navigate, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { CommandsPage } from "./pages/docs/commands";
import { CiIntegrationPage } from "./pages/docs/ci-integration";
import { FAQPage } from "./pages/docs/faq";
import { ContributingPage } from "./pages/docs/contributing";
import { GettingStartedPage } from "./pages/docs/getting-started";
import { InstallationPage } from "./pages/docs/installation";
import { IntroductionPage } from "./pages/docs/introduction";
import { TheGuardPage } from "./pages/docs/the-guard";
import { WhatArvenDetectsPage } from "./pages/docs/what-arven-detects";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/docs" element={<Navigate to="/docs/introduction" replace />} />
      <Route path="/docs/introduction" element={<IntroductionPage />} />
      <Route path="/docs/installation" element={<InstallationPage />} />
      <Route path="/docs/getting-started" element={<GettingStartedPage />} />
      <Route path="/docs/contributing" element={<ContributingPage />} />
      <Route path="/docs/commands" element={<CommandsPage />} />
      <Route path="/docs/the-guard" element={<TheGuardPage />} />
      <Route path="/docs/what-arven-detects" element={<WhatArvenDetectsPage />} />
      <Route path="/docs/ci-integration" element={<CiIntegrationPage />} />
      <Route path="/docs/faq" element={<FAQPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
