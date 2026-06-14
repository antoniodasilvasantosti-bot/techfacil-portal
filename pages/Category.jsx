import { useState, useEffect } from "react";
import { Article, Category, Subcategory } from "@/api/entities";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Clock, Eye, Star, Filter, ChevronRight,
  Zap, Shield, Smartphone, Settings, Keyboard, BookOpen,
  TrendingUp, SortAsc, Grid, List, X
} from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen };

export default function CategoryPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("id");
  const subParam = params.get("sub");

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [activeSubcat, setActiveSubcat] = useState(subParam || "all");
  const [activeDiff, setActiveDiff] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (categoryId) loadData(); }, [categoryId]);
  useEffect(() => { applyFilters(); }, [articles, activeSubcat, activeDiff, sortBy]);

  async function loadData() {
    const [cats, subcats, arts] = await Promise.all([
      Category.list(),
      Subcategory.filter({ category_id: categoryId }),
      Article.filter({ category_id: categoryId, published: true })
    ]);
    const cat = cats.find(c => c.id === categoryId);
    setCategory(cat);
    setAllCategories(cats.sort((a, b) => a.order - b.order));
    setSubcategories(subcats.sort((a, b) => a.order - b.order));
    setArticles(arts);
    setLoading(false);
  }

  function applyFilters() {
    let result = [...articles];
    if (activeSubcat !== "all") result = result.filter(a => a.subcategory_id === activeSubcat);
    if (activeDiff !== "all") result = result.filter(a => a.difficulty === activeDiff);
    if (sortBy === "popular") result.sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortBy === "recent") result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === "rating") result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    if (sortBy === "fast") result.sort((a, b) => (a.reading_time || 0) - (b.reading_time || 0));
    setFiltered(result);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
    </div>
  );

  if (!category) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <div className="text-5xl">😕</div>
      <p className="text-lg font-bold">Categoria não encontrada</p>
      <Link to={createPageUrl("Home")} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition">← Início</Link>
    </div>
  );

  const Icon = iconMap[category.icon] || Zap;
  const featuredInCat = filtered.filter(a => a.featured);
  const totalViews = articles.reduce((s, a) => s + (a.views || 0), 0);
  const avgRating = articles.length ? (articles.reduce((s, a) => s + (a.average_rating || 0), 0) / articles.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HERO DA CATEGORIA */}
      <div className="relative overflow-hidden py-10 px-4"
        style={{ background: `linear-gradient(135deg, ${category.color}18 0%, ${category.color}08 60%, transparent 100%)`, borderBottom: `1px solid ${category.color}25` }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-15" style={{ background: category.color }} />
        </div>
        <div className="max-w-6xl mx-auto relative">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-1.5 text-gray-600 text-xs mb-5">
            <Link to={createPageUrl("Home")} className="hover:text-white transition">Início</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: category.color }}>{category.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl"
              style={{ background: `${category.color}25`, border: `2px solid ${category.color}45` }}>
              <Icon className="w-8 h-8" style={{ color: category.color }} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{category.name}</h1>
              <p className="text-gray-400">{category.description}</p>
            </div>
            {/* MINI STATS */}
            <div className="flex gap-4 sm:flex-col sm:items-end text-right">
              <div>
                <div className="text-xl font-black text-white">{articles.length}</div>
                <div className="text-xs text-gray-600">artigos</div>
              </div>
              <div>
                <div className="text-xl font-black text-white">{totalViews.toLocaleString()}</div>
                <div className="text-xs text-gray-600">leituras</div>
              </div>
              <div>
                <div className="text-xl font-black text-yellow-400 flex items-center gap-1 justify-end">
                  <Star className="w-4 h-4 fill-yellow-400" />{avgRating}
                </div>
                <div className="text-xs text-gray-600">avaliação</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* SUBCATEGORIAS */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => setActiveSubcat("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeSubcat === "all" ? "text-white border-transparent shadow-lg" : "bg-white/4 text-gray-400 border-white/8 hover:bg-white/8 hover:text-white"}`}
              style={activeSubcat === "all" ? { background: category.color, boxShadow: `0 4px 15px ${category.color}44` } : {}}>
              Todos
            </button>
            {subcategories.map(s => (
              <button key={s.id} onClick={() => setActiveSubcat(s.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeSubcat === s.id ? "text-white border-transparent shadow-lg" : "bg-white/4 text-gray-400 border-white/8 hover:bg-white/8 hover:text-white"}`}
                style={activeSubcat === s.id ? { background: category.color, boxShadow: `0 4px 15px ${category.color}44` } : {}}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-center gap-3 mb-6 pb-5 border-b border-white/8">
          <div className="flex items-center gap-1 text-gray-600 text-xs">
            <Filter className="w-3.5 h-3.5" /> Nível:
          </div>
          {["all", "Iniciante", "Intermediário", "Avançado"].map(d => (
            <button key={d} onClick={() => setActiveDiff(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${activeDiff === d ? "bg-white text-black border-white" : "bg-white/4 text-gray-600 border-white/8 hover:bg-white/10 hover:text-white"}`}>
              {d === "all" ? "Todos" : d}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <SortAsc className="w-3.5 h-3.5 text-gray-600" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer">
              <option value="popular">Mais vistos</option>
              <option value="rating">Melhor avaliados</option>
              <option value="recent">Mais recentes</option>
              <option value="fast">Leitura rápida</option>
            </select>
            <div className="flex border border-white/10 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-1.5 transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-gray-600 hover:text-white"}`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode("list")} className={`p-1.5 transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-gray-600 hover:text-white"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* CONTAGEM */}
        <p className="text-gray-600 text-sm mb-4">
          <span className="text-white font-semibold">{filtered.length}</span> artigo{filtered.length !== 1 ? "s" : ""}
          {activeSubcat !== "all" && <span> em <span style={{ color: category.color }}>{subcategories.find(s => s.id === activeSubcat)?.name}</span></span>}
        </p>

        {/* ARTIGOS */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-bold text-white mb-1">Nenhum artigo encontrado</p>
            <p className="text-sm">Tente remover os filtros</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => (
              <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                className="group bg-white/4 border border-white/8 rounded-2xl p-5 hover:bg-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer block">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${category.color}20`, color: category.color }}>{a.difficulty}</span>
                  {a.featured && <span className="text-xs text-yellow-400 font-semibold">⭐ Destaque</span>}
                </div>
                <h3 className="font-bold text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2 text-sm">{a.title}</h3>
                <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">{a.summary}</p>
                {a.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {a.tags.slice(0, 3).map(t => <span key={t} className="text-xs text-gray-700 bg-white/3 px-2 py-0.5 rounded-full">#{t}</span>)}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-600 pt-3 border-t border-white/5">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(a.views||0).toLocaleString()}</span>
                  <span className="flex items-center gap-1 ml-auto text-yellow-500"><Star className="w-3 h-3 fill-yellow-500" />{(a.average_rating||0).toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => (
              <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                className="group flex items-start gap-4 bg-white/4 border border-white/8 rounded-xl px-5 py-4 hover:bg-white/8 hover:border-white/18 transition-all cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${category.color}20`, color: category.color }}>{a.difficulty}</span>
                    {a.featured && <span className="text-xs text-yellow-400">⭐</span>}
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors line-clamp-1">{a.title}</h3>
                  <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">{a.summary}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 text-xs text-gray-600">
                  <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3 h-3 fill-yellow-500" />{(a.average_rating||0).toFixed(1)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(a.views||0).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* OUTRAS CATEGORIAS */}
        <div className="mt-12 pt-8 border-t border-white/8">
          <h3 className="text-base font-bold text-white mb-4">Explorar outras categorias</h3>
          <div className="flex flex-wrap gap-2">
            {allCategories.filter(c => c.id !== categoryId).map(c => {
              const CIcon = iconMap[c.icon] || Zap;
              return (
                <Link key={c.id} to={createPageUrl("Category") + `?id=${c.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 text-sm font-semibold"
                  style={{ background: `${c.color}15`, border: `1px solid ${c.color}30`, color: c.color }}>
                  <CIcon className="w-4 h-4" />{c.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
