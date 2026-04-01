import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import Layout from "./layout/Layout.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Collection = lazy(() => import("./pages/Collection.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Services = lazy(() => import("./pages/Services.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));

function RouteFallback() {
  return <div className="portfolio-route-loading" aria-live="polite">Загрузка страницы…</div>;
}

/** Корневой роутинг приложения портфолио. */
export default function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Suspense fallback={<RouteFallback />}><Home /></Suspense>} />
          <Route path="/collection" element={<Suspense fallback={<RouteFallback />}><Collection /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<RouteFallback />}><About /></Suspense>} />
          <Route path="/services" element={<Suspense fallback={<RouteFallback />}><Services /></Suspense>} />
          <Route path="/blog/:postId" element={<Suspense fallback={<RouteFallback />}><BlogPost /></Suspense>} />
          <Route path="/blog" element={<Suspense fallback={<RouteFallback />}><Blog /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<RouteFallback />}><Contact /></Suspense>} />
        </Route>
      </Routes>
    </SettingsProvider>
  );
}
