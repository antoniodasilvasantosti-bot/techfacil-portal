import { useState, useEffect } from "react";
import { Article, Category } from "@/api/entities";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search, Clock, Eye, Star, Filter, Shield, Smartphone,
  Zap, Settings, Keyboard, BookOpen, TrendingUp, X,
  Grid, List, SortAsc, ChevronRight
} from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen };

export default function Articles() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState(urlParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDiff, setActiveDiff] = useState("all");
  const [sortBy, setSortBy] = useState(urlParams.get("sort") || "popular");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { applyFilters(); }, [articles, search, activeCategory, activeDiff, sortBy]);

  async function loadData() {
    const [arts, cats] = await Promise.all([Article.filter({ published: true }), Category.list()]);
    setArticles(arts);
    setCategories(cats.sort((a, b) => a.order - b.order));
    setLoading(false);
  }

  function applyFilters() {
    let result = [...articles];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory !== "all") result = result.filter(a => a.category_id === activeCategory);
    if (activeDiff !== "all") result = result.filter(a => a.difficulty === activeDiff);
    if (sortBy === "popular") result.sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortBy === "rating") result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    if (sortBy === "recent") result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === "fast") result.sort((a, b) => (a.reading_time || 0) - (b.reading_time || 0));
    setFiltered(result);
  }

  function clearAll() { setSearch(""); setActiveCategory("all"); setActiveDiff("all"); setSortBy("popular"); }

  const hasFilters = search || activeCategory !== "all" || activeDiff !== "all";

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gradient-to-br from-gray-900 to-gray-950 border-b border-white/10 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Link to={createPageUrl("Home")} className="text-gray-600 hover:text-white text-sm transition flex items-center gap-1">
              Início <ChevronRight className="w-3 h-3" />
            </Link>
            <span className="text-gray-600 text-sm">Artigos</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">📚 Todos os Artigos</h1>
          <p className="text-gray-500 mb-6">{articles.length} artigos gratuitos sobre tecnologia e educação digital</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título, assunto ou tag..."
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/25 transition text-sm" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* FILTRO CATEGORIAS */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-white/8">
          <button onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === "all" ? "bg-white text-black shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"}`}>
            Todas
          </button>
          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || Zap;
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(isActive ? "all" : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? "text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
                style={isActive
                  ? { background: cat.color, boxShadow: `0 4px 15px ${cat.color}44` }
                  : { background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
                <Icon className="w-3.5 h-3.5" style={!isActive ? { color: cat.color } : {}} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* FILTROS SECUNDÁRIOS */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 text-gray-600 text-sm"><Filter className="w-3.5 h-3.5" /> Nível:</div>
          {["all", "Iniciante", "Intermediário", "Avançado"].map(d => (
            <button key={d} onClick={() => setActiveDiff(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeDiff === d ? "bg-white text-black border-white" : "bg-white/4 text-gray-500 border-white/8 hover:bg-white/10 hover:text-white"}`}>
              {d === "all" ? "Todos" : d}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <SortAsc className="w-3.5 h-3.5 text-gray-600" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-400 cursor-pointer">
                <option value="popular">Mais populares</option>
                <option value="rating">Melhor avaliados</option>
                <option value="recent">Mais recentes</option>
                <option value="fast">Leitura rápida</option>
              </select>
            </div>
            <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-gray-600 hover:text-white"}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-gray-600 hover:text-white"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            <span className="text-white font-semibold">{filtered.length}</span> artigo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            {search && <span> para "<span className="text-purple-400">{search}</span>"</span>}
          </p>
          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-bold text-white mb-1">Nenhum artigo encontrado</p>
            <p className="text-sm mb-4">Tente outros termos ou remova os filtros</p>
            <button onClick={clearAll} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white text-sm font-semibold transition">Limpar filtros</button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => <ArticleCardGrid key={a.id} article={a} categories={categories} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => <ArticleCardList key={a.id} article={a} categories={categories} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCardGrid({ article: a, categories }) {
  const cat = categories.find(c => c.id === a.category_id);
  return (
    <Link to={createPageUrl("Article") + `?slug=${a.slug}`}
      className="group flex flex-col bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/20 rounded-2xl p-5 transition-all hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-3">
        {cat && <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${cat.color}25`, color: cat.color }}>{cat.name}</span>}
        {a.featured && <span className="text-xs text-yellow-400 ml-auto">⭐</span>}
      </div>
      <h3 className="font-bold text-white group-hover:text-purple-300 transition leading-snug mb-2 line-clamp-2">{a.title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">{a.summary}</p>
      <div className="flex items-center justify-between text-xs text-gray-600 mt-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views || 0}</span>
        </div>
        {a.average_rating > 0 && (
          <span className="flex items-center gap-1 text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" />{a.average_rating?.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}

function ArticleCardList({ article: a, categories }) {
  const cat = categories.find(c => c.id === a.category_id);
  return (
    <Link to={createPageUrl("Article") + `?slug=${a.slug}`}
      className="group flex items-start gap-4 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/20 rounded-2xl p-4 transition-all">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          {cat && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${cat.color}25`, color: cat.color }}>{cat.name}</span>}
          <span className="text-xs text-gray-600 px-2 py-0.5 rounded-full bg-white/5">{a.difficulty}</span>
        </div>
        <h3 className="font-bold text-white group-hover:text-purple-300 transition text-base mb-1 line-clamp-1">{a.title}</h3>
        <p className="text-gray-500 text-xs line-clamp-1">{a.summary}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5 text-xs text-gray-600 flex-shrink-0">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views || 0}</span>
        {a.average_rating > 0 && <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" />{a.average_rating?.toFixed(1)}</span>}
      </div>
    </Link>
  );
}
