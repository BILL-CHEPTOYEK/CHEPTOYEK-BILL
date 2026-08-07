import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import GitHubPage from './pages/GitHubPage';
import ToolsIndexPage from './pages/tools/ToolsIndexPage';
import JsonFormatterPage from './pages/tools/JsonFormatterPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

export default function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/tools" element={<ToolsIndexPage />} />
        <Route path="/tools/json-formatter" element={<JsonFormatterPage />} />
        <Route path="/github" element={<GitHubPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </BrowserRouter>
  );
}
