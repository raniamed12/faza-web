import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import { Header, Footer, Loading } from "./components/common.jsx";
import { useAuth } from "./context.jsx";
import Home from "./pages/Home.jsx";

const Explorer = lazy(() => import("./pages/Explorer.jsx"));
const Governorate = lazy(() => import("./pages/Governorate.jsx"));
const Place = lazy(() => import("./pages/Place.jsx"));
const Mix = lazy(() => import("./pages/Mix.jsx"));
const Events = lazy(() => import("./pages/Events.jsx"));
const Community = lazy(() => import("./pages/Community.jsx"));
const ProposePlace = lazy(() => import("./pages/ProposePlace.jsx"));
const Auth = lazy(() => import("./pages/Auth.jsx"));
const MySpace = lazy(() => import("./pages/MySpace.jsx"));
const Shared = lazy(() => import("./pages/Shared.jsx"));
const Benna = lazy(() => import("./benna/Benna.jsx"));
const NotFound = () => (
  <div className="wrap section lost">
    <p className="lost__n" aria-hidden="true">4<span>🧭</span>4</p>
    <h1 className="h-lg">Tlifna ! <span className="ar" lang="ar">تلفنا</span></h1>
    <p className="lead">On s’est perdus dans la médina : cette page n’existe pas (encore). Pas de panique, toutes les ruelles mènent quelque part.</p>
    <div className="hero__cta" style={{ justifyContent: "center" }}><Link className="btn btn--terra" to="/">Retour à l’accueil</Link><Link className="btn btn--ghost" to="/explorer">Explorer la carte</Link></div>
  </div>
);

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { if (!pathname.startsWith("/benna")) window.scrollTo(0, 0); }, [pathname]);
  return null;
}
const Private = ({ children }) => {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Loading />;
  return user ? children : <Navigate to="/connexion" state={{ from: loc.pathname + loc.search }} replace />;
};

export default function App() {
  const { pathname } = useLocation();
  const immersive = pathname.startsWith("/benna");
  return (
    <>
      <a className="sr-only" href="#main">Aller au contenu</a>
      <Header />
      <ScrollTop />
      <main id="main">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/gouvernorat/:slug" element={<Governorate />} />
            <Route path="/lieu/:slug" element={<Place />} />
            <Route path="/mix" element={<Mix />} />
            <Route path="/jaw-tounsna" element={<Events />} />
            <Route path="/communaute" element={<Community />} />
            <Route path="/communaute/proposer" element={<Private><ProposePlace /></Private>} />
            <Route path="/connexion" element={<Auth mode="login" />} />
            <Route path="/inscription" element={<Auth mode="register" />} />
            <Route path="/mon-espace" element={<Private><MySpace /></Private>} />
            <Route path="/programme/:code" element={<Shared />} />
            <Route path="/benna/*" element={<Benna />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!immersive && <Footer />}
    </>
  );
}
