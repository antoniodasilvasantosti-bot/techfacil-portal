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
    }, 150);
  }

  function keepMega() {
    clearTimeout(megaTimer.current);
  }

  const activeCat = categories.find(c => c.id === activeMegaCat);
  const activeSubs = subcategories.filter(s => s.category_id === activeMegaCat);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-black text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent leading-none">TechFácil</div>
                <div className="text-xs text-gray-600 leading-none mt-0.5">Tecnologia para todos</div>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-1">
              <Link to={createPageUrl("Home")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPageName === "Home" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Home className="w-4 h-4" /> Início
              </Link>

              {/* CATEGORIAS COM MEGA MENU */}
              {categories.map(cat => {
                const Icon = iconMap[cat.icon] || Zap;
                const isActive = activeMegaCat === cat.id && megaMenuOpen;
                return (
                  <div key={cat.id} className="relative"
                    onMouseEnter={() => openMega(cat.id)}
                    onMouseLeave={closeMega}>
                    <Link to={createPageUrl("Category") + `?id=${cat.id}`}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                      style={isActive ? { background: `${cat.color}22`, color: cat.color } : {}}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.name}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isActive ? "rotate-180" : ""}`} />
                    </Link>
                  </div>
                );
              })}

              <Link to={createPageUrl("Articles")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentPageName === "Articles" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                <Search className="w-4 h-4" /> Todos
              </Link>
            </div>

            {/* AÇÕES DIREITA */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* SEARCH BAR MOBILE */}
          {searchOpen && (
            <div className="pb-3 lg:hidden animate-in slide-in-from-top-1 duration-150">
              <form onSubmit={e => { e.preventDefault(); const q = e.target.q.value; if (q) window.location.href = createPageUrl("Articles") + `?q=${q}`; }}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input name="q" placeholder="Buscar artigos..." autoFocus
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400 transition" />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* MEGA MENU DESKTOP */}
        {megaMenuOpen && activeCat && (
          <div
            onMouseEnter={keepMega}
            onMouseLeave={closeMega}
            className="absolute left-0 right-0 top-full z-50 bg-gray-900/98 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex gap-8">
                {/* CAT INFO */}
                <div className="w-56 flex-shrink-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${activeCat.color}22` }}>
                      {(() => { const I = iconMap[activeCat.icon] || Zap; return <I className="w-5 h-5" style={{ color: activeCat.color }} />; })()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{activeCat.name}</p>
                      <p className="text-xs text-gray-500">{activeSubs.length} subtópicos</p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{activeCat.description}</p>
                  <Link to={createPageUrl("Category") + `?id=${activeCat.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition hover:opacity-80"
                    style={{ background: `${activeCat.color}22`, color: activeCat.color }}>
                    Ver todos <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* DIVIDER */}
                <div className="w-px bg-white/10 self-stretch" />

                {/* SUBCATEGORIAS */}
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider mb-4">Subtópicos</p>
                  {activeSubs.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
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
                    <p className="text-gray-600 text-sm">Novos subtópicos em breve!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-gray-950/98 backdrop-blur-md overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="px-4 py-4 space-y-1">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5 transition font-semibold">
              <Home className="w-5 h-5 text-purple-400" /> Início
            </Link>
            <Link to={createPageUrl("Articles")} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-white/5 transition font-semibold">
              <Search className="w-5 h-5 text-blue-400" /> Todos os Artigos
            </Link>

            <div className="pt-4 pb-2">
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest px-4 mb-2">Categorias</p>
            </div>

            {categories.map(cat => {
              const Icon = iconMap[cat.icon] || Zap;
              const subs = subcategories.filter(s => s.category_id === cat.id);
              const isExpanded = mobileExpandedCat === cat.id;
              return (
                <div key={cat.id}>
                  <button
                    onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}22` }}>
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-white font-semibold text-sm">{cat.name}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="ml-4 pl-4 border-l border-white/10 space-y-1 mb-2">
                      <Link to={createPageUrl("Category") + `?id=${cat.id}`}
                        className="flex items-center gap-2 py-2 px-2 rounded-lg text-sm font-semibold transition hover:bg-white/5"
                        style={{ color: cat.color }}>
                        Ver todos em {cat.name}
                      </Link>
                      {subs.map(sub => {
                        const SubIcon = iconMap[sub.icon] || Zap;
                        return (
                          <Link key={sub.id}
                            to={createPageUrl("Category") + `?id=${cat.id}&sub=${sub.id}`}
                            className="flex items-center gap-2 py-2 px-2 rounded-lg text-sm text-gray-400 hover:text-white transition hover:bg-white/5">
                            <SubIcon className="w-3.5 h-3.5" style={{ color: sub.color }} />
                            {sub.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-gray-950 px-4 pt-12 pb-6 mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* BRAND */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">TechFácil</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Portal de tecnologia e educação digital 100% gratuito. Dicas práticas para o seu dia a dia.
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-400">✓</span> 100% Gratuito, sempre
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-400">✓</span> Funciona no celular e PC
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-400">✓</span> Salve artigos em PDF
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-green-400">✓</span> Compartilhe com amigos
                </div>
              </div>
            </div>

            {/* CATEGORIAS */}
            <div className="md:col-span-2">
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Categorias</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => {
                  const Icon = iconMap[cat.icon] || Zap;
                  return (
                    <Link key={cat.id} to={createPageUrl("Category") + `?id=${cat.id}`}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/5 transition group">
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cat.color }} />
                      <span className="text-gray-500 group-hover:text-white text-sm transition-colors">{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* LINKS RÁPIDOS */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Explorar</h4>
              <div className="space-y-2">
                <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition py-1">
                  <Home className="w-3.5 h-3.5" /> Início
                </Link>
                <Link to={createPageUrl("Articles")} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition py-1">
                  <BookOpen className="w-3.5 h-3.5" /> Todos os Artigos
                </Link>
                <Link to={createPageUrl("Articles") + "?diff=Iniciante"} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition py-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Para Iniciantes
                </Link>
                <Link to={createPageUrl("Articles") + "?diff=Avançado"} className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition py-1">
                  <Brain className="w-3.5 h-3.5" /> Conteúdo Avançado
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-gray-700 text-sm">© 2025 TechFácil • Tecnologia para todos 💜</p>
            <p className="text-gray-700 text-xs">Feito com ❤️ para facilitar sua vida digital</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
