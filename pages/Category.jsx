import { useState, useEffect } from "react";
import { Article, Category, Subcategory } from "@/api/entities";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Clock, Eye, Star, Filter, ChevronDown, Zap, Shield, Smartphone, Settings, Keyboard, BookOpen } from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen };

export default function CategoryPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get("id");

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeSubcat, setActiveSubcat] = useState("all");
  const [activeDiff, setActiveDiff] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    if (categoryId) loadData();
  }, [categoryId]);

  useEffect(() => {
    applyFilters();
  }, [articles, activeSubcat, activeDiff, sortBy]);

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
    if (sortBy === "recent") result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    if (sortBy === "popular") result.sort((a, b) => (b.views || 0) - (a.views || 0));
    if (sortBy === "rating") result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    setFiltered(result);
  }

  if (loading) return <LoadingScreen />;
  if (!category) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Categoria não encontrada</div>;

  const Icon = iconMap[category.icon] || Zap;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* HEADER */}
      <div className="relative overflow-hidden py-12 px-4" style={{ background: `linear-gradient(135deg, ${category.color}22, ${category.color}11, transparent)`, borderBottom: `1px solid ${category.color}33` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: category.color }} />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <Link to={createPageUrl("Home")} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Voltar ao início
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${category.color}33`, border: `2px solid ${category.color}55` }}>
              <Icon className="w-8 h-8" style={{ color: category.color }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">{category.name}</h1>
              <p className="text-gray-400 mt-1">{category.description}</p>
              <p className="text-sm mt-2" style={{ color: category.color }}>{filtered.length} artigo{filtered.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* SUBCATEGORIAS */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button onClick={() => setActiveSubcat("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeSubcat === "all" ? "text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
              style={activeSubcat === "all" ? { background: category.color } : {}}>
              Todos
            </button>
            {subcategories.map(s => (
              <button key={s.id} onClick={() => setActiveSubcat(s.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeSubcat === s.id ? "text-white shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                style={activeSubcat === s.id ? { background: category.color } : {}}>
                {s.name}
              </button>
            ))}
          </div>
        )}

        {/* FILTROS */}
        <div className="flex flex-wrap gap-3 mb-8 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm">Filtrar:</span>
          </div>
          {["all", "Iniciante", "Intermediário", "Avançado"].map(d => (
            <button key={d} onClick={() => setActiveDiff(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeDiff === d ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              {d === "all" ? "Qualquer nível" : d}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-500 text-sm">Ordenar:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-400">
              <option value="recent">Mais recentes</option>
              <option value="popular">Mais vistos</option>
              <option value="rating">Melhor avaliados</option>
            </select>
          </div>
        </div>

        {/* ARTIGOS */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg">Nenhum artigo encontrado com esses filtros</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => <ArticleCard key={a.id} article={a} category={category} />)}
          </div>
        )}

        {/* OUTRAS CATEGORIAS */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Explorar outras categorias</h3>
          <div className="flex flex-wrap gap-3">
            {allCategories.filter(c => c.id !== categoryId).map(c => {
              const CIcon = iconMap[c.icon] || Zap;
              return (
                <Link key={c.id} to={createPageUrl("Category") + `?id=${c.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105"
                  style={{ background: `${c.color}22`, border: `1px solid ${c.color}44`, color: c.color }}>
                  <CIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, category }) {
  return (
    <Link to={createPageUrl("Article") + `?slug=${article.slug}`}
      className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-xl cursor-pointer block hover:-translate-y-1">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${category.color}22`, color: category.color }}>
          {article.difficulty}
        </span>
        {article.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">⭐ Destaque</span>}
      </div>
      <h3 className="font-bold text-white leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">{article.title}</h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-4">{article.summary}</p>
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {article.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.reading_time} min</span>
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views?.toLocaleString()}</span>
        <span className="flex items-center gap-1 ml-auto"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{article.average_rating?.toFixed(1)}</span>
      </div>
    </Link>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
