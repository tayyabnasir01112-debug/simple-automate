import { Route, Routes } from 'react-router-dom';
import { MarketingLayout } from './components/layout/MarketingLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { HomePage } from './pages/marketing/HomePage';
import { AboutPage } from './pages/marketing/AboutPage';
import { PricingPage } from './pages/marketing/PricingPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { TermsPage } from './pages/marketing/TermsPage';
import { PrivacyPage } from './pages/marketing/PrivacyPage';
import { FeaturePage } from './pages/marketing/FeaturePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { VerifyPendingPage } from './pages/auth/VerifyPendingPage';
import { DashboardPage } from './pages/app/DashboardPage';
import { ContactsPage } from './pages/app/ContactsPage';
import { PipelinesPage } from './pages/app/PipelinesPage';
import { AutomationsPage } from './pages/app/AutomationsPage';
import { CampaignsPage } from './pages/app/CampaignsPage';
import { TemplatesPage } from './pages/app/TemplatesPage';
import { SettingsPage } from './pages/app/SettingsPage';

const App = () => (
  <Routes>
    <Route element={<MarketingLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/features/crm" element={<FeaturePage path="/features/crm" />} />
      <Route path="/features/automation" element={<FeaturePage path="/features/automation" />} />
      <Route path="/features/email-marketing" element={<FeaturePage path="/features/email-marketing" />} />
      <Route path="/features/pipelines" element={<FeaturePage path="/features/pipelines" />} />
    </Route>

    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/verify-email" element={<VerifyEmailPage />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/verify-pending" element={<VerifyPendingPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/pipelines" element={<PipelinesPage />} />
        <Route path="/automations" element={<AutomationsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Route>
  </Routes>
);

export default App;
