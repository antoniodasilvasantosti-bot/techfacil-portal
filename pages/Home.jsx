import { useState, useEffect } from "react";
import { Article, Category } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Shield, Smartphone, Zap, Settings, Keyboard, BookOpen,
  Star, Clock, Eye, TrendingUp, ChevronRight, Sparkles,
  ArrowRight, Flame, BookMarked, GraduationCap, X
} from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen };

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [popular, setPopular] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => { loadData(); }, []);

  // Auto-rotate hero
  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % Math.min(featured.length, 4)), 5000);
    return () => clearInterval(t);
  }, [featured]);

  // Live search
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const q = search.toLowerCase();
    const results = allArticles.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.summary?.toLowerCase().includes(q) ||
      a.tags?.some(t => t.toLowerCase().includes(q))
    );
    setSearchResults(results.slice(0, 6));
  }, [search, allArticles]);

  async function loadData() {
    const [cats, arts] = await Promise.all([
      Category.list(),
      Article.filter({ published: true })
    ]);
    setCategories(cats.sort((a, b) => a.order - b.order));
    setAllArticles(arts);
    setFeatured(arts.filter(a => a.featured).slice(0, 4));
    const byDate = [...arts].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setRecent(byDate.slice(0, 6));
    const byViews = [...arts].sort((a, b) => (b.views || 0) - (a.views || 0));
    setPopular(byViews.slice(0, 5));
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  const heroArticle = featured[heroIndex];

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* HERO COM DESTAQUE ROTATIVO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        {/* Background blur balls */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* LEFT */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Tecnologia gratuita para todos 🚀</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">TechFácil</span>
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed mb-6">
                Dicas, tutoriais, truques e novidades de tecnologia — <span className="text-white font-semibold">de forma simples e prática</span>.
              </p>

              {/* BUSCA */}
              <div className="relative">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Buscar dicas, tutoriais, atalhos..."
                      className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white/8 backdrop-blur border border-white/15 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition text-sm"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Link to={createPageUrl("Articles")}
                    className="px-5 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-purple-600/30 text-sm whitespace-nowrap">
                    Ver todos
                  </Link>
                </div>

                {/* DROPDOWN DE BUSCA */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2">
                      <p className="text-xs text-gray-600 px-3 py-1.5 font-semibold">{searchResults.length} resultado(s) para "{search}"</p>
                      {searchResults.map(a => {
                        const cat = categories.find(c => c.id === a.category_id);
                        return (
                          <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition group">
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: cat?.color || '#888' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium group-hover:text-purple-300 transition-colors truncate">{a.title}</p>
                              <p className="text-gray-600 text-xs">{cat?.name} • {a.reading_time} min</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10 p-2">
                      <Link to={createPageUrl("Articles")} onClick={() => setSearch("")}
                        className="flex items-center justify-center gap-1 text-xs text-purple-400 hover:text-purple-300 py-1.5 transition font-semibold">
                        Ver todos os artigos <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* STATS RÁPIDOS */}
              <div className="flex gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{allArticles.length}+</div>
                  <div className="text-xs text-gray-600">Artigos</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">6</div>
                  <div className="text-xs text-gray-600">Categorias</div>
                </div>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs text-gray-600">Gratuito</div>
                </div>
              </div>
            </div>

            {/* RIGHT: ARTIGO DESTAQUE ROTATIVO */}
            {heroArticle && (
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Artigo em Destaque
                    <span className="ml-auto flex gap-1">
                      {featured.slice(0, 4).map((_, i) => (
                        <button key={i} onClick={() => setHeroIndex(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === heroIndex ? "bg-purple-400 w-4" : "bg-white/20"}`} />
                      ))}
                    </span>
                  </div>
                  <Link to={createPageUrl("Article") + `?slug=${heroArticle.slug}`}
                    className="block bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-2xl p-6 hover:border-white/30 transition-all duration-500 group">
                    {(() => { const cat = categories.find(c => c.id === heroArticle.category_id); return cat ? (
                      <span className="inline-block text-xs px-3 py-1 rounded-full font-semibold mb-4" style={{ background: `${cat.color}33`, color: cat.color }}>
                        {cat.name}
                      </span>
                    ) : null; })()}
                    <h2 className="text-xl font-black text-white leading-tight mb-3 group-hover:text-purple-300 transition-colors">{heroArticle.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{heroArticle.summary}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{heroArticle.reading_time} min</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{heroArticle.views?.toLocaleString()}</span>
                      <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{heroArticle.average_rating?.toFixed(1)}</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIAS COLORIDAS */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-7 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
          <h2 className="text-xl font-bold text-white">Explorar por Categoria</h2>
          <Link to={createPageUrl("Articles")} className="ml-auto flex items-center gap-1 text-gray-500 hover:text-white text-sm transition">
            Ver tudo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Zap;
            return (
              <Link key={cat.id} to={createPageUrl("Category") + `?id=${cat.id}`}
                className="group relative overflow-hidden rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${cat.color}18, ${cat.color}30)`,
                  border: `1px solid ${cat.color}35`,
                  animationDelay: `${i * 50}ms`
                }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${cat.color}28, ${cat.color}50)` }} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ background: `${cat.color}25` }}>
                    <Icon className="w-6 h-6" style={{ color: cat.color }} />
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">{cat.name}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ARTIGOS EM DESTAQUE */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full" />
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Destaques
            </h2>
            <Link to={createPageUrl("Articles")} className="ml-auto flex items-center gap-1 text-gray-500 hover:text-white text-sm transition">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {featured.slice(0, 4).map((a, i) => {
              const cat = categories.find(c => c.id === a.category_id);
              return (
                <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                  className="group relative overflow-hidden bg-gradient-to-br from-white/5 to-white/8 border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer block">
                  <div className="absolute top-0 right-0 w-28 h-28 opacity-10 rounded-bl-full pointer-events-none"
                    style={{ background: cat ? `radial-gradient(circle, ${cat.color}, transparent)` : 'transparent' }} />
                  <div className="flex items-center gap-2 mb-3">
                    {cat && <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: `${cat.color}28`, color: cat.color }}>{cat.name}</span>}
                    {i === 0 && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full font-semibold">🔥 Top</span>}
                  </div>
                  <h3 className="font-black text-white text-lg leading-tight mb-2 group-hover:text-purple-300 transition-colors">{a.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{a.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views?.toLocaleString()}</span>
                    </div>
                    <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                      <Star className="w-4 h-4 fill-yellow-400" />{a.average_rating?.toFixed(1)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SEÇÃO: MAIS POPULARES + RECENTES */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* POPULARES */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" /> Mais Vistos
              </h2>
            </div>
            <div className="space-y-3">
              {popular.map((a, i) => {
                const cat = categories.find(c => c.id === a.category_id);
                return (
                  <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition group cursor-pointer">
                    <span className="text-2xl font-black w-7 flex-shrink-0 leading-none mt-0.5"
                      style={{ color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#f97316' : '#4b5563' }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-semibold leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">{a.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        {cat && <span style={{ color: cat.color }}>{cat.name}</span>}
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{a.views?.toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RECENTES */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-emerald-400" /> Artigos Recentes
              </h2>
              <Link to={createPageUrl("Articles")} className="ml-auto flex items-center gap-1 text-gray-500 hover:text-white text-sm transition">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recent.map(a => {
                const cat = categories.find(c => c.id === a.category_id);
                return (
                  <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                    className="group bg-white/4 border border-white/8 rounded-xl p-4 hover:bg-white/8 hover:border-white/20 transition-all duration-300 cursor-pointer block">
                    <div className="flex items-center gap-2 mb-2">
                      {cat && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cat.color}20`, color: cat.color }}>
                          {cat.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{a.difficulty}</span>
                    </div>
                    <h3 className="font-bold text-white text-sm leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">{a.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-auto">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                      <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{a.average_rating?.toFixed(1)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* BANNER POR NÍVEL */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { level: "Iniciante", icon: GraduationCap, color: "#10b981", desc: "Perfeito para quem está começando", emoji: "🌱" },
            { level: "Intermediário", icon: BookOpen, color: "#3b82f6", desc: "Para quem já tem alguma base", emoji: "📘" },
            { level: "Avançado", icon: Zap, color: "#f59e0b", desc: "Técnicas e configurações avançadas", emoji: "⚡" }
          ].map(({ level, icon: Icon, color, desc, emoji }) => (
            <Link key={level} to={createPageUrl("Articles") + `?diff=${level}`}
              className="group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 hover:scale-102 hover:shadow-xl cursor-pointer"
              style={{ background: `${color}10`, borderColor: `${color}25` }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${color}20` }}>
                <span className="text-2xl">{emoji}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">{level}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-t-purple-500 rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 text-sm">Carregando TechFácil...</p>
      </div>
    </div>
  );
}
