import { useState, useEffect } from "react";
import { Article, Category } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, Clock, Eye, Star, Filter, Shield, Smartphone, Zap, Settings, Keyboard, BookOpen, TrendingUp, X } from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen };

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDiff, setActiveDiff] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  useEffect(() => { applyFilters(); }, [articles, search, activeCategory, activeDiff, sortBy]);

  async function loadData() {
    const [arts, cats] = await Promise.all([
      Article.filter({ published: true }),
      Category.list()
    ]);
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
    setFiltered(result);
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-950 border-b border-white/10 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">📚 Todos os Artigos</h1>
          <p className="text-gray-400 mb-6">Explore todo o conteúdo disponível no TechFácil</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar artigos, dicas, tutoriais..."
              className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* FILTRO CATEGORIAS */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === "all" ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
            Todas
          </button>
          {categories.map(cat => {
            const Icon = iconMap[cat.icon] || Zap;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeCategory === cat.id ? "text-white shadow-lg" : "text-gray-400 hover:bg-white/10"}`}
                style={activeCategory === cat.id ? { background: cat.color, boxShadow: `0 4px 15px ${cat.color}44` } : { background: `${cat.color}15` }}>
                <Icon className="w-3.5 h-3.5" style={activeCategory !== cat.id ? { color: cat.color } : {}} />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* FILTROS SECUNDÁRIOS */}
        <div className="flex flex-wrap gap-3 items-center mb-8 pb-6 border-b border-white/10">
          <Filter className="w-4 h-4 text-gray-600" />
          {["all", "Iniciante", "Intermediário", "Avançado"].map(d => (
            <button key={d} onClick={() => setActiveDiff(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeDiff === d ? "bg-white text-black" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}>
              {d === "all" ? "Todos os níveis" : d}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none">
              <option value="popular">Mais populares</option>
              <option value="rating">Melhor avaliados</option>
              <option value="recent">Mais recentes</option>
            </select>
          </div>
        </div>

        {/* RESULTADOS */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm">
            {filtered.length} artigo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            {search && <span> para "<span className="text-white">{search}</span>"</span>}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-semibold mb-2">Nenhum artigo encontrado</p>
            <p className="text-sm">Tente outros termos ou remova os filtros</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => {
              const cat = categories.find(c => c.id === a.category_id);
              return (
                <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer block">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {cat && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${cat.color}22`, color: cat.color }}>
                        {cat.name}
                      </span>
                    )}
                    <span className="text-xs bg-white/5 text-gray-500 px-2 py-1 rounded-full">{a.difficulty}</span>
                    {a.featured && <span className="text-xs text-yellow-400">⭐</span>}
                  </div>
                  <h3 className="font-bold text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">{a.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{a.summary}</p>
                  {a.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {a.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-xs bg-white/5 text-gray-600 px-2 py-0.5 rounded-full">#{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.views?.toLocaleString()}</span>
                    <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{a.average_rating?.toFixed(1)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
