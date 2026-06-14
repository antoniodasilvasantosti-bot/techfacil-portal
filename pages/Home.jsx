import { useState, useEffect } from "react";
import { Article, Category } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Shield, Smartphone, Zap, Settings, Keyboard, BookOpen,
  Star, Clock, Eye, TrendingUp, ChevronRight, Sparkles,
  ArrowRight, Flame, BookMarked, GraduationCap, X
} from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen, GraduationCap };

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

  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % Math.min(featured.length, 4)), 5000);
    return () => clearInterval(t);
  }, [featured]);

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
    const [cats, arts] = await Promise.all([Category.list(), Article.filter({ published: true })]);
    setCategories(cats.sort((a, b) => a.order - b.order));
    setAllArticles(arts);
    setFeatured(arts.filter(a => a.featured).slice(0, 4));
    setRecent([...arts].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 6));
    setPopular([...arts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5));
    setLoading(false);
  }

  if (loading) return <LoadingScreen />;

  const heroArticle = featured[heroIndex];

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* ESQUERDA */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full text-sm mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Tecnologia gratuita para todos 🚀</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black leading-tight mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">TechFácil</span>
              </h1>
              <p className="text-gray-400 text-xl leading-relaxed mb-6">
                Dicas, tutoriais, truques e novidades de tecnologia —{" "}
                <span className="text-white font-semibold">de forma simples e prática</span>.
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

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2">
                      <p className="text-xs text-gray-600 px-3 py-1.5 font-semibold">{searchResults.length} resultado(s) para "{search}"</p>
                      {searchResults.map(a => {
                        const cat = categories.find(c => c.id === a.category_id);
                        return (
                          <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition group"
                            onClick={() => setSearch("")}>
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: cat?.color || '#888' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium group-hover:text-purple-300 transition truncate">{a.title}</p>
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

              {/* STATS */}
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

            {/* DIREITA: ARTIGO EM DESTAQUE */}
            {heroArticle && (
              <div className="hidden lg:block">
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> Artigo em Destaque
                  <span className="ml-auto flex gap-1">
                    {featured.slice(0, 4).map((_, i) => (
                      <button key={i} onClick={() => setHeroIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === heroIndex ? "bg-purple-400 w-4" : "bg-white/20 w-1.5"}`} />
                    ))}
                  </span>
                </div>
                <Link to={createPageUrl("Article") + `?slug=${heroArticle.slug}`}
                  className="block bg-gradient-to-br from-white/8 to-white/4 border border-white/15 rounded-2xl p-6 hover:border-white/30 transition-all duration-500 group">
                  {(() => {
                    const cat = categories.find(c => c.id === heroArticle.category_id);
                    return cat ? (
                      <span className="inline-block text-xs px-3 py-1 rounded-full font-semibold mb-4" style={{ background: `${cat.color}33`, color: cat.color }}>{cat.name}</span>
                    ) : null;
                  })()}
                  <h2 className="text-xl font-black text-white leading-tight mb-3 group-hover:text-purple-300 transition-colors">{heroArticle.title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{heroArticle.summary}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{heroArticle.reading_time} min</span>
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{heroArticle.views || 0}</span>
                    {heroArticle.average_rating > 0 && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" />{heroArticle.average_rating?.toFixed(1)}</span>}
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">📂 Categorias</h2>
          <Link to={createPageUrl("Articles")} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition">
            Ver tudo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || Zap;
            return (
              <Link key={cat.id} to={createPageUrl("Category") + `?id=${cat.id}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 text-center"
                style={{ background: `${cat.color}12`, borderColor: `${cat.color}30` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: `${cat.color}25` }}>
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-bold text-white leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ARTIGOS EM DESTAQUE */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" /> Destaques
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map(a => <ArticleCard key={a.id} article={a} categories={categories} />)}
          </div>
        </section>
      )}

      {/* MAIS POPULARES + RECENTES */}
      <section className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-8">
        {/* MAIS VISTOS */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Mais vistos
          </h2>
          <div className="space-y-3">
            {popular.map((a, i) => {
              const cat = categories.find(c => c.id === a.category_id);
              return (
                <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/15 transition-all group">
                  <span className="text-2xl font-black w-7 text-center flex-shrink-0" style={{ color: cat?.color || '#888' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold group-hover:text-purple-300 transition line-clamp-2">{a.title}</p>
                    <p className="text-gray-600 text-xs mt-1 flex items-center gap-2">
                      <Eye className="w-3 h-3" />{a.views || 0} • {a.reading_time} min
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* RECENTES */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-green-400" /> Recentes
            </h2>
            <Link to={createPageUrl("Articles") + "?sort=recent"} className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recent.map(a => <ArticleCard key={a.id} article={a} categories={categories} compact />)}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/50 via-blue-900/30 to-gray-900 border border-purple-500/20 p-8 md:p-12 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Explore todo o conteúdo</h2>
            <p className="text-gray-400 text-lg mb-6">Mais de {allArticles.length} artigos gratuitos sobre tecnologia e educação digital</p>
            <Link to={createPageUrl("Articles")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-600/30">
              Ver todos os artigos <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article: a, categories, compact }) {
  const cat = categories.find(c => c.id === a.category_id);
  return (
    <Link to={createPageUrl("Article") + `?slug=${a.slug}`}
      className="group block bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/20 rounded-2xl p-4 transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-2 mb-2">
        {cat && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cat.color}25`, color: cat.color }}>{cat.name}</span>}
        {a.featured && <span className="text-xs text-yellow-400">⭐</span>}
      </div>
      <h3 className={`font-bold text-white group-hover:text-purple-300 transition leading-tight mb-2 ${compact ? "text-sm line-clamp-2" : "text-base line-clamp-2"}`}>{a.title}</h3>
      {!compact && <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{a.summary}</p>}
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views || 0}</span>
        {a.average_rating > 0 && <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />{a.average_rating?.toFixed(1)}</span>}
      </div>
    </Link>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
      <p className="text-gray-500 text-sm animate-pulse">Carregando TechFácil...</p>
    </div>
  );
}
