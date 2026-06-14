import { useState, useEffect, useRef } from "react";
import { Article, Category, Comment } from "@/api/entities";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Clock, Eye, Star, Share2, Printer, Download,
  MessageCircle, Send, CheckCircle, Shield,
  Smartphone, Zap, Settings, Keyboard, BookOpen, Check,
  ThumbsUp, ChevronRight, Tag, BarChart2
} from "lucide-react";

const iconMap = { Shield, Smartphone, Zap, Settings, Keyboard, BookOpen };

export default function ArticlePage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");

  const [article, setArticle] = useState(null);
  const [category, setCategory] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingDone, setRatingDone] = useState(false);
  const [commentForm, setCommentForm] = useState({ author_name: "", author_email: "", content: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [likedComments, setLikedComments] = useState({});
  const articleRef = useRef(null);

  useEffect(() => { if (slug) loadData(); }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const el = articleRef.current;
      const scrolled = window.scrollY - el.offsetTop + 100;
      const total = el.offsetHeight - window.innerHeight + 100;
      setReadProgress(Math.max(0, Math.min(100, (scrolled / total) * 100)));
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

  async function loadData() {
    const arts = await Article.filter({ slug, published: true });
    if (!arts.length) { setLoading(false); return; }
    const art = arts[0];
    setArticle(art);
    Article.update(art.id, { views: (art.views || 0) + 1 });
    const [cats, comms, allArts] = await Promise.all([
      Category.list(),
      Comment.filter({ article_id: art.id, approved: true }),
      Article.filter({ category_id: art.category_id, published: true })
    ]);
    setCategory(cats.find(c => c.id === art.category_id) || null);
    setComments(comms.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setRelated(allArts.filter(a => a.id !== art.id).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3));
    setLoading(false);
  }

  async function handleRate(n) {
    if (ratingDone) return;
    setUserRating(n);
    setRatingDone(true);
    const totalRatings = (article.total_ratings || 0) + 1;
    const newAvg = ((article.average_rating || 0) * (article.total_ratings || 0) + n) / totalRatings;
    await Article.update(article.id, { total_ratings: totalRatings, average_rating: parseFloat(newAvg.toFixed(2)) });
    setArticle(prev => ({ ...prev, average_rating: parseFloat(newAvg.toFixed(2)), total_ratings: totalRatings }));
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentForm.author_name || !commentForm.content) return;
    setSubmitting(true);
    await Comment.create({ ...commentForm, article_id: article.id, approved: true, likes: 0 });
    setSubmitted(true);
    setSubmitting(false);
    const updated = await Comment.filter({ article_id: article.id, approved: true });
    setComments(updated.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
  }

  async function likeComment(c) {
    if (likedComments[c.id]) return;
    const newLikes = (c.likes || 0) + 1;
    await Comment.update(c.id, { likes: newLikes });
    setLikedComments(prev => ({ ...prev, [c.id]: true }));
    setComments(prev => prev.map(cm => cm.id === c.id ? { ...cm, likes: newLikes } : cm));
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.summary, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function renderContent(text) {
    if (!text) return "";
    return text
      .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;color:#e2e8f0;margin:1.5rem 0 0.5rem">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:1.3rem;font-weight:800;color:#f1f5f9;margin:2rem 0 0.75rem">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:1.6rem;font-weight:900;color:#fff;margin:2rem 0 1rem">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e2e8f0;font-weight:700">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em style="color:#cbd5e1">$1</em>')
      .replace(/`([^`\n]+)`/g, '<code style="background:#1e293b;color:#a78bfa;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.875em">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #8b5cf6;padding:0.75rem 1rem;background:#1e1b4b33;color:#a5b4fc;margin:1rem 0;border-radius:0 8px 8px 0">$1</blockquote>')
      .replace(/^[-*] (.+)$/gm, '<li style="color:#cbd5e1;padding:0.25rem 0;margin-left:1.5rem;list-style:disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li style="color:#cbd5e1;padding:0.25rem 0;margin-left:1.5rem;list-style:decimal">$1</li>')
      .replace(/\n\n/g, '</p><p style="color:#94a3b8;line-height:1.8;margin-bottom:1rem">');
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <div className="text-6xl">😕</div>
      <p className="text-xl font-bold">Artigo não encontrado</p>
      <Link to={createPageUrl("Home")} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition font-semibold">← Voltar ao início</Link>
    </div>
  );

  const diffColor = { Iniciante: "#10b981", Intermediário: "#3b82f6", Avançado: "#ef4444" }[article.difficulty] || "#6b7280";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* BARRA DE PROGRESSO */}
      <div className="fixed top-0 left-0 z-50 h-1 transition-all duration-100"
        style={{ width: `${readProgress}%`, background: category ? `linear-gradient(90deg, ${category.color}, #8b5cf6)` : 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />

      {/* NAVBAR DO ARTIGO */}
      <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link to={category ? createPageUrl("Category") + `?id=${category.id}` : createPageUrl("Home")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm group flex-shrink-0">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{category?.name || "Voltar"}</span>
          </Link>
          <div className="flex-1 min-w-0 hidden md:block">
            <p className="text-gray-500 text-sm truncate">{article.title}</p>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-full" style={{ width: `${readProgress}%` }} />
              </div>
              <span className="text-xs text-gray-600">{Math.round(readProgress)}%</span>
            </div>
            <button onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition">
              {copied ? <><Check className="w-3.5 h-3.5 text-green-400" />Copiado!</> : <><Share2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Compartilhar</span></>}
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium transition print:hidden">
              <Printer className="w-3.5 h-3.5" /><span className="hidden sm:inline">Imprimir</span>
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-xs font-medium transition print:hidden">
              <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* CABEÇALHO */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {category && (
              <Link to={createPageUrl("Category") + `?id=${category.id}`}
                className="text-xs px-3 py-1 rounded-full font-bold transition hover:opacity-80"
                style={{ background: `${category.color}28`, color: category.color }}>
                {category.name}
              </Link>
            )}
            <span className="text-xs px-3 py-1 rounded-full font-semibold border"
              style={{ background: `${diffColor}15`, color: diffColor, borderColor: `${diffColor}30` }}>
              {article.difficulty}
            </span>
            {article.featured && <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-3 py-1 rounded-full font-bold">⭐ Destaque</span>}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{article.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-5">{article.summary}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-5 border-b border-white/10">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.reading_time} min de leitura</span>
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{article.views || 0} leituras</span>
            {article.average_rating > 0 && (
              <span className="flex items-center gap-1.5 text-yellow-400">
                <Star className="w-4 h-4 fill-yellow-400" />
                {article.average_rating?.toFixed(1)} ({article.total_ratings} avaliações)
              </span>
            )}
            <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />{comments.length} comentários</span>
          </div>
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <Tag className="w-3.5 h-3.5 text-gray-600 mt-0.5" />
              {article.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/8">{tag}</span>
              ))}
            </div>
          )}
        </header>

        {/* CONTEÚDO */}
        <article ref={articleRef}
          className="prose prose-invert max-w-none mb-12"
          style={{ color: '#94a3b8', lineHeight: '1.8' }}>
          <div dangerouslySetInnerHTML={{
            __html: `<p style="color:#94a3b8;line-height:1.8;margin-bottom:1rem">${renderContent(article.content)}</p>`
          }} />
        </article>

        {/* AVALIAR */}
        <div className="bg-white/4 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-yellow-400" /> Avalie este artigo
          </h3>
          <p className="text-gray-500 text-sm mb-4">Sua avaliação ajuda outros leitores!</p>
          {ratingDone ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Obrigado pela avaliação! Você deu {userRating} estrela{userRating !== 1 ? "s" : ""}.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n}
                  onClick={() => handleRate(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all hover:scale-125 active:scale-95">
                  <Star className={`w-8 h-8 transition-colors ${n <= (hoverRating || userRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                </button>
              ))}
              <span className="text-gray-500 text-sm ml-2">{hoverRating ? `${hoverRating} estrela${hoverRating !== 1 ? "s" : ""}` : "Clique para avaliar"}</span>
            </div>
          )}
        </div>

        {/* ARTIGOS RELACIONADOS */}
        {related.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-black text-white mb-4">📖 Artigos relacionados</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(a => (
                <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                  className="group bg-white/3 hover:bg-white/6 border border-white/8 hover:border-white/20 rounded-xl p-4 transition-all">
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition mb-2 line-clamp-2">{a.title}</h4>
                  <p className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* COMENTÁRIOS */}
        <div id="comments">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" /> Comentários ({comments.length})
          </h3>

          {/* FORM */}
          {!submitted ? (
            <form onSubmit={submitComment} className="bg-white/4 border border-white/10 rounded-2xl p-6 mb-8">
              <h4 className="font-bold text-white mb-4">Deixe seu comentário</h4>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Nome *</label>
                  <input value={commentForm.author_name} onChange={e => setCommentForm(p => ({ ...p, author_name: e.target.value }))}
                    placeholder="Seu nome" required
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400 transition" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Email (opcional)</label>
                  <input value={commentForm.author_email} onChange={e => setCommentForm(p => ({ ...p, author_email: e.target.value }))}
                    placeholder="seu@email.com" type="email"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400 transition" />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 font-semibold mb-1.5 block">Comentário *</label>
                <textarea value={commentForm.content} onChange={e => setCommentForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Escreva seu comentário..." required rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400 transition resize-none" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-2">Sua nota para o artigo:</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setCommentForm(p => ({ ...p, rating: n }))}
                        className="transition hover:scale-125">
                        <Star className={`w-6 h-6 ${n <= commentForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50">
                  {submitting ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar</>}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/25 rounded-2xl p-5 mb-8">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Comentário enviado!</p>
                <p className="text-gray-400 text-sm">Obrigado pela contribuição 🎉</p>
              </div>
            </div>
          )}

          {/* LISTA DE COMENTÁRIOS */}
          {comments.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Seja o primeiro a comentar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {c.author_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{c.author_name}</p>
                        <p className="text-xs text-gray-600">{new Date(c.created_date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    {c.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`w-3.5 h-3.5 ${n <= c.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{c.content}</p>
                  <button onClick={() => likeComment(c)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${likedComments[c.id] ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white"}`}>
                    <ThumbsUp className="w-3.5 h-3.5" /> {c.likes || 0} curtida{(c.likes || 0) !== 1 ? "s" : ""}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SCROLL TO TOP */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-10 h-10 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all hover:scale-110 print:hidden z-40">
          <ChevronRight className="w-5 h-5 text-white rotate-[-90deg]" />
        </button>
      )}
    </div>
  );
}
