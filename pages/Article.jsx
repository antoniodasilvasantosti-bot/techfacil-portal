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

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

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
    await Comment.create({
      ...commentForm,
      article_id: article.id,
      rating: commentForm.rating,
      approved: true,
      likes: 0
    });
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
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^\| (.+) \|$/gm, (match) => {
        const cells = match.split('|').map(c => c.trim()).filter(c => c && !c.match(/^[-\s:]+$/));
        if (!cells.length) return '';
        return `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      })
      .replace(/^[-*] (.+)$/gm, '<li class="bullet">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ordered">$1</li>')
      .replace(/\n\n/g, '</p><p>');
  }

  if (loading) return <Loader />;
  if (!article) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <div className="text-6xl">😕</div>
      <p className="text-xl font-bold">Artigo não encontrado</p>
      <Link to={createPageUrl("Home")} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition font-semibold">← Voltar ao início</Link>
    </div>
  );

  const diffColor = { Iniciante: "#10b981", Intermediário: "#3b82f6", Avançado: "#ef4444" }[article.difficulty] || "#6b7280";
  const ratingPercent = article.average_rating ? ((article.average_rating / 5) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* PROGRESSO DE LEITURA */}
      <div className="fixed top-0 left-0 z-50 h-1 transition-all duration-100"
        style={{ width: `${readProgress}%`, background: category ? `linear-gradient(90deg, ${category.color}, #8b5cf6)` : 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />

      {/* NAVBAR STICKY */}
      <div className="sticky top-0 z-40 bg-gray-950/92 backdrop-blur-md border-b border-white/10 px-4 py-3">
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
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 rounded-full"
                  style={{ width: `${readProgress}%` }} />
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
        {/* CABEÇALHO DO ARTIGO */}
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
            {article.featured && (
              <span className="text-xs bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 px-3 py-1 rounded-full font-bold">⭐ Destaque</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{article.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">{article.summary}</p>

          {/* MÉTRICAS */}
          <div className="flex flex-wrap items-center gap-4 pb-5 border-b border-white/10">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-blue-400" />{article.reading_time} min de leitura
            </span>
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4 text-green-400" />{(article.views || 0).toLocaleString()} visualizações
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${n <= Math.round(article.average_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                ))}
              </div>
              <span className="text-yellow-400 font-bold text-sm">{(article.average_rating || 0).toFixed(1)}</span>
              <span className="text-gray-600 text-xs">({article.total_ratings || 0})</span>
            </div>
          </div>

          {/* TAGS */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              <Tag className="w-3.5 h-3.5 text-gray-600 mt-0.5" />
              {article.tags.map(t => (
                <span key={t} className="text-xs bg-white/5 text-gray-500 px-2.5 py-1 rounded-full border border-white/8 hover:bg-white/10 hover:text-gray-300 transition cursor-default">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* CONTEÚDO DO ARTIGO */}
        <article ref={articleRef} className="article-content mb-10">
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 md:p-8"
            dangerouslySetInnerHTML={{ __html: renderContent(article.content) }} />
        </article>

        {/* AVALIAÇÃO */}
        <div className={`rounded-2xl p-6 mb-8 text-center border transition-all ${ratingDone ? "bg-green-900/20 border-green-500/25" : "bg-gradient-to-br from-purple-900/25 to-blue-900/25 border-purple-500/20"}`}>
          {ratingDone ? (
            <div>
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-bold text-lg">Obrigado pela avaliação!</p>
              <p className="text-gray-500 text-sm mt-1">Sua nota ajuda outros leitores 💜</p>
            </div>
          ) : (
            <div>
              <p className="text-white font-bold text-lg mb-1">O que achou deste artigo?</p>
              <p className="text-gray-500 text-sm mb-5">Clique nas estrelas para avaliar</p>
              <div className="flex justify-center gap-3 mb-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(n)}
                    className="transition-all hover:scale-125 active:scale-110">
                    <Star className={`w-9 h-9 transition-all duration-150 ${n <= (hoverRating || userRating) ? "text-yellow-400 fill-yellow-400 drop-shadow-lg" : "text-gray-600"}`} />
                  </button>
                ))}
              </div>
              <p className="text-gray-600 text-xs">{["","Ruim","Regular","Bom","Muito bom","Excelente!"][hoverRating || userRating] || "Toque nas estrelas"}</p>
            </div>
          )}
        </div>

        {/* AÇÕES */}
        <div className="flex flex-wrap gap-3 mb-12 print:hidden">
          <button onClick={handleShare}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 font-semibold transition border border-blue-500/25 text-sm">
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition border border-white/10 text-sm">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 font-semibold transition border border-purple-500/25 text-sm">
            <Download className="w-4 h-4" /> Salvar PDF
          </button>
        </div>

        {/* ESTATÍSTICA DO ARTIGO */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          {[
            { label: "Visualizações", value: (article.views||0).toLocaleString(), icon: Eye, color: "#10b981" },
            { label: "Avaliação", value: `${(article.average_rating||0).toFixed(1)}/5`, icon: Star, color: "#f59e0b" },
            { label: "Comentários", value: comments.length, icon: MessageCircle, color: "#8b5cf6" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
              <div className="text-xl font-black text-white">{value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* COMENTÁRIOS */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full" />
            <h2 className="text-xl font-bold text-white">Comentários</h2>
            <span className="bg-white/5 text-gray-500 text-sm px-2.5 py-0.5 rounded-full border border-white/10">{comments.length}</span>
          </div>

          {comments.length > 0 ? (
            <div className="space-y-4 mb-8">
              {comments.map(c => (
                <div key={c.id} className="bg-white/4 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {c.author_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{c.author_name}</p>
                        <p className="text-xs text-gray-600">{new Date(c.created_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {[1,2,3,4,5].map(n => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= (c.rating||0) ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
                  <div className="flex items-center justify-end mt-3">
                    <button onClick={() => likeComment(c)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${likedComments[c.id] ? "bg-purple-600/20 text-purple-300" : "text-gray-600 hover:text-white hover:bg-white/5"}`}>
                      <ThumbsUp className="w-3.5 h-3.5" /> {c.likes || 0} útil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600 mb-8 border border-dashed border-white/10 rounded-2xl">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Nenhum comentário ainda</p>
              <p className="text-sm mt-1">Seja o primeiro a comentar!</p>
            </div>
          )}

          {/* FORMULÁRIO */}
          {submitted ? (
            <div className="bg-green-900/25 border border-green-500/25 rounded-2xl p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-green-300 font-bold text-lg">Comentário publicado!</p>
              <p className="text-gray-500 text-sm mt-1">Obrigado por contribuir com a comunidade 💜</p>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-400" /> Deixar comentário
              </h3>
              <form onSubmit={submitComment} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Nome *</label>
                    <input value={commentForm.author_name} onChange={e => setCommentForm({...commentForm, author_name: e.target.value})} required
                      placeholder="Seu nome"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">E-mail (opcional)</label>
                    <input value={commentForm.author_email} onChange={e => setCommentForm({...commentForm, author_email: e.target.value})}
                      placeholder="seu@email.com" type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Sua nota</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setCommentForm({...commentForm, rating: n})}
                        className="transition-all hover:scale-110">
                        <Star className={`w-6 h-6 ${n <= commentForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                      </button>
                    ))}
                    <span className="text-gray-600 text-sm self-center ml-1">
                      {["","Ruim","Regular","Bom","Muito bom","Excelente!"][commentForm.rating]}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1.5 block">Comentário *</label>
                  <textarea value={commentForm.content} onChange={e => setCommentForm({...commentForm, content: e.target.value})} required
                    placeholder="Compartilhe sua opinião, dúvida ou experiência sobre este artigo..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 text-sm shadow-lg shadow-purple-600/25">
                  <Send className="w-4 h-4" />
                  {submitting ? "Publicando..." : "Publicar comentário"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ARTIGOS RELACIONADOS */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-7 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full" />
              <h2 className="text-xl font-bold text-white">Artigos relacionados</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(a => (
                <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                  className="group bg-white/4 border border-white/8 rounded-xl p-4 hover:bg-white/8 hover:border-white/18 transition-all cursor-pointer block hover:-translate-y-0.5">
                  <h3 className="font-bold text-white text-sm leading-snug mb-3 group-hover:text-purple-300 transition-colors line-clamp-2">{a.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{(a.average_rating||0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: category?.color }}>
                    Ler artigo <ChevronRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTÃO VOLTAR AO TOPO */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-600/40 transition-all hover:scale-110 print:hidden">
          <ArrowLeft className="w-5 h-5 text-white rotate-90" />
        </button>
      )}

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-gray-950, .bg-white\\/\\[0\\.03\\] { background: white !important; }
          h1,h2,h3 { color: black !important; }
          p,li,td { color: #333 !important; }
        }
        .article-content h1 { font-size: 1.6rem; font-weight: 900; color: white; margin: 1.5rem 0 1rem; }
        .article-content h2 { font-size: 1.2rem; font-weight: 800; color: #c4b5fd; margin: 2rem 0 0.875rem; padding-left: 0.75rem; border-left: 3px solid #8b5cf6; }
        .article-content h3 { font-size: 1.05rem; font-weight: 700; color: white; margin: 1.5rem 0 0.75rem; }
        .article-content p { color: #9ca3af; line-height: 1.85; margin: 0.75rem 0; }
        .article-content strong { color: white; font-weight: 700; }
        .article-content em { color: #d1d5db; font-style: italic; }
        .article-content code { background: rgba(139,92,246,0.18); color: #c4b5fd; padding: 0.15rem 0.45rem; border-radius: 0.3rem; font-family: monospace; font-size: 0.85em; border: 1px solid rgba(139,92,246,0.28); }
        .article-content blockquote { border-left: 4px solid #8b5cf6; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: rgba(139,92,246,0.08); border-radius: 0 0.75rem 0.75rem 0; color: #d1d5db; font-style: italic; }
        .article-content li.bullet { display: flex; align-items: flex-start; gap: 0.6rem; color: #d1d5db; margin: 0.4rem 0; }
        .article-content li.bullet::before { content: "•"; color: #8b5cf6; font-weight: bold; flex-shrink: 0; margin-top: 0.05rem; }
        .article-content li.ordered { display: flex; align-items: flex-start; gap: 0.6rem; color: #d1d5db; margin: 0.4rem 0; }
        .article-content li.ordered::before { content: "→"; color: #8b5cf6; font-weight: bold; flex-shrink: 0; }
        .article-content tr { border-bottom: 1px solid rgba(255,255,255,0.06); }
        .article-content td { padding: 0.55rem 0.75rem; font-size: 0.875rem; color: #d1d5db; }
        .article-content td:first-child { font-weight: 600; color: white; }
        .article-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; border-radius: 0.75rem; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin" />
        </div>
        <p className="text-gray-600 text-sm">Carregando artigo...</p>
      </div>
    </div>
  );
}
