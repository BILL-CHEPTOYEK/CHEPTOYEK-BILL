import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import GitHubPage from './pages/GitHubPage';
import ToolsIndexPage from './pages/tools/ToolsIndexPage';
import JsonFormatterPage from './pages/tools/JsonFormatterPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

// Split out of the main bundle: the diagram and the diff engine are only worth
// downloading for the people who actually open those pages.
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage'));
const ConfigDiffPage = lazy(() => import('./pages/tools/ConfigDiffPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const NotePage = lazy(() => import('./pages/NotePage'));

function RouteFallback() {
  return <div className="min-h-screen bg-neutral-50" />;
}

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/tools" element={<ToolsIndexPage />} />
          <Route path="/tools/json-formatter" element={<JsonFormatterPage />} />
          <Route path="/tools/config-diff" element={<ConfigDiffPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/notes/:slug" element={<NotePage />} />
          <Route path="/github" element={<GitHubPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
