import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Category, Subcategory } from "@/api/entities";
import {
  Home, BookOpen, Shield, Smartphone, Zap, Settings, Keyboard,
  Menu, X, ChevronDown, Search, ExternalLink, Cpu,
  Lock, AlertTriangle, Eye, MessageCircle, Cloud, Monitor,
  Globe, Code, Brain, GraduationCap
} from "lucide-react";

const iconMap = {
  Shield, Smartphone, Zap, Settings, Keyboard, BookOpen,
  Lock, AlertTriangle, Eye, MessageCircle, Cloud, Monitor,
  Globe, Code, Brain, GraduationCap, Cpu, Home
};

export default function Layout({ children, currentPageName }) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeMegaCat, setActiveMegaCat] = useState(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const megaTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    Promise.all([Category.list(), Subcategory.list()]).then(([cats, subs]) => {
      setCategories(cats.sort((a, b) => a.order - b.order));
      setSubcategories(subs.sort((a, b) => a.order - b.order));
    });
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  function openMega(catId) {
    clearTimeout(megaTimer.current);
    setActiveMegaCat(catId);
    setMegaMenuOpen(true);
  }

  function closeMega() {
    megaTimer.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setActiveMegaCat(null);
    }, 200);
  }

  function keepMega() { clearTimeout(megaTimer.current); }

  const activeCat = categories.find(c => c.id === activeMegaCat);
  const activeSubs = subcategories.filter(s => s.category_id === activeMegaCat);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* ===== NAVBAR PRINCIPAL ===== */}
      <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-110 transition-all duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-black text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent leading-none">TechFácil</div>
                <div className="text-xs text-gray-500 leading-none mt-0.5 hidden sm:block">Tecnologia para todos</div>
              </div>
            </Link>

            {/* NAV DESKTOP — visível em md (768px+) */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center mx-4">
              <Link to={createPageUrl("Home")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentPageName === "Home" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Home className="w-4 h-4" />
                <span>Início</span>
              </Link>

              {categories.map(cat => {
                const Icon = iconMap[cat.icon] || Zap;
                const isActive = activeMegaCat === cat.id && megaMenuOpen;
                return (
                  <div key={cat.id} className="relative"
                    onMouseEnter={() => openMega(cat.id)}
                    onMouseLeave={closeMega}>
                    <button
                      className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                      style={isActive ? { background: `${cat.color}28`, color: cat.color } : {}}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={isActive ? { color: cat.color } : {}} />
                      <span className="hidden lg:inline">{cat.name}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${isActive ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                );
              })}

              <Link to={createPageUrl("Articles")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${currentPageName === "Articles" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Search className="w-4 h-4" />
                <span>Todos</span>
              </Link>
            </div>

            {/* AÇÕES DIREITA */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/8 text-white hover:bg-white/15 transition">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* BUSCA MOBILE */}
          {searchOpen && (
            <div className="pb-3 md:hidden">
              <form onSubmit={e => {
                e.preventDefault();
                const q = e.target.q.value;
                if (q) window.location.href = createPageUrl("Articles") + `?q=${encodeURIComponent(q)}`;
              }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="q" placeholder="Buscar artigos..." autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400 transition" />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ===== MEGA MENU DESKTOP ===== */}
        {megaMenuOpen && activeCat && (
          <div
            onMouseEnter={keepMega}
            onMouseLeave={closeMega}
            className="absolute left-0 right-0 top-full z-50 bg-gray-900/98 backdrop-blur-md border-b border-white/10 shadow-2xl shadow-black/60">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex gap-8">
                <div className="w-52 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${activeCat.color}22` }}>
                      {(() => { const I = iconMap[activeCat.icon] || Zap; return <I className="w-5 h-5" style={{ color: activeCat.color }} />; })()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{activeCat.name}</p>
                      <p className="text-xs text-gray-500">{activeSubs.length} subtópicos</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">{activeCat.description}</p>
                  <Link to={createPageUrl("Category") + `?id=${activeCat.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition hover:opacity-80"
                    style={{ background: `${activeCat.color}22`, color: activeCat.color }}>
                    Ver todos <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
                <div className="w-px bg-white/10 self-stretch" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-3">Subtópicos</p>
                  {activeSubs.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                      {activeSubs.map(sub => {
                        const SubIcon = iconMap[sub.icon] || Zap;
                        return (
                          <Link key={sub.id}
                            to={createPageUrl("Category") + `?id=${activeCat.id}&sub=${sub.id}`}
                            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 transition-all group">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${sub.color}22` }}>
                              <SubIcon className="w-3.5 h-3.5" style={{ color: sub.color }} />
                            </div>
                            <span className="text-sm text-gray-300 group-hover:text-white font-medium transition-colors">{sub.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">Conteúdo em breve...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ===== BARRA DE CATEGORIAS COLORIDAS (sempre visível) ===== */}
      <div className="bg-gray-900/80 border-b border-white/8 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-4 py-2 max-w-7xl mx-auto min-w-max">
          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || Zap;
            return (
              <Link key={cat.id}
                to={createPageUrl("Category") + `?id=${cat.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:scale-105 active:scale-95"
                style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}35` }}>
                <Icon className="w-3 h-3" />
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== MENU MOBILE ===== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900 border-l border-white/10 overflow-y-auto shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-black text-white text-lg">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-white/5 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-1">
              <Link to={createPageUrl("Home")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-white/5 hover:bg-white/10 transition font-medium">
                <Home className="w-5 h-5" /> Início
              </Link>
              {categories.map(cat => {
                const Icon = iconMap[cat.icon] || Zap;
                const subs = subcategories.filter(s => s.category_id === cat.id);
                const isExpanded = mobileExpandedCat === cat.id;
                return (
                  <div key={cat.id}>
                    <button
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                      <span className="flex-1 text-left">{cat.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isExpanded && subs.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link to={createPageUrl("Category") + `?id=${cat.id}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition"
                          style={{ color: cat.color }}>
                          Ver todos em {cat.name}
                        </Link>
                        {subs.map(sub => (
                          <Link key={sub.id}
                            to={createPageUrl("Category") + `?id=${cat.id}&sub=${sub.id}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sub.color }} />
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link to={createPageUrl("Articles")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition font-medium">
                <Search className="w-5 h-5" /> Todos os Artigos
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-white/8 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-white text-lg bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">TechFácil</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">Tecnologia e educação digital de forma simples e gratuita para todos.</p>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3">Categorias</p>
              <div className="space-y-2">
                {categories.slice(0, 4).map(cat => (
                  <Link key={cat.id} to={createPageUrl("Category") + `?id=${cat.id}`}
                    className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3">Mais categorias</p>
              <div className="space-y-2">
                {categories.slice(4).map(cat => (
                  <Link key={cat.id} to={createPageUrl("Category") + `?id=${cat.id}`}
                    className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-sm mb-3">Acesso rápido</p>
              <div className="space-y-2">
                <Link to={createPageUrl("Home")} className="block text-gray-500 hover:text-white text-sm transition">🏠 Início</Link>
                <Link to={createPageUrl("Articles")} className="block text-gray-500 hover:text-white text-sm transition">📚 Todos os artigos</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-600 text-sm">© 2026 TechFácil — Tecnologia gratuita para todos 🚀</p>
            <p className="text-gray-700 text-xs">Feito com ❤️ no Brasil</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
