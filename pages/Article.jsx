import { useState, useEffect, useRef } from "react";
import { Article, Category, Comment } from "@/api/entities";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft, Clock, Eye, Star, Share2, Printer, Download,
  MessageCircle, ThumbsUp, Send, CheckCircle, Shield,
  Smartphone, Zap, Settings, Keyboard, BookOpen, Copy, Check
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
  const [commentForm, setCommentForm] = useState({ author_name: "", author_email: "", content: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef(null);

  useEffect(() => {
    if (slug) loadData();
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const el = articleRef.current;
      const scrolled = window.scrollY - el.offsetTop;
      const total = el.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(100, (scrolled / total) * 100));
      setReadProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [article]);

  async function loadData() {
    const arts = await Article.filter({ slug, published: true });
    if (!arts.length) { setLoading(false); return; }
    const art = arts[0];
    setArticle(art);
    await Article.update(art.id, { views: (art.views || 0) + 1 });
    const [cats, comms, allArts] = await Promise.all([
      Category.list(),
      Comment.filter({ article_id: art.id, approved: true }),
      Article.filter({ category_id: art.category_id, published: true })
    ]);
    const cat = cats.find(c => c.id === art.category_id);
    setCategory(cat);
    setComments(comms);
    setRelated(allArts.filter(a => a.id !== art.id).slice(0, 3));
    setLoading(false);
  }

  async function submitComment(e) {
    e.preventDefault();
    if (!commentForm.author_name || !commentForm.content) return;
    setSubmitting(true);
    await Comment.create({
      ...commentForm,
      article_id: article.id,
      rating: userRating || commentForm.rating,
      approved: true,
      likes: 0
    });
    const totalRatings = (article.total_ratings || 0) + 1;
    const newAvg = ((article.average_rating || 0) * (article.total_ratings || 0) + (userRating || commentForm.rating)) / totalRatings;
    await Article.update(article.id, { total_ratings: totalRatings, average_rating: newAvg });
    setSubmitted(true);
    setSubmitting(false);
    const updatedComments = await Comment.filter({ article_id: article.id, approved: true });
    setComments(updatedComments);
  }

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.summary, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownloadPDF() {
    window.print();
  }

  function renderMarkdown(text) {
    if (!text) return "";
    return text
      .replace(/^#{3} (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-3">$1</h3>')
      .replace(/^#{2} (.+)$/gm, '<h2 class="text-xl font-bold text-purple-300 mt-8 mb-4 flex items-center gap-2"><span class="w-1 h-6 bg-purple-400 rounded inline-block mr-2"></span>$1</h2>')
      .replace(/^#{1} (.+)$/gm, '<h1 class="text-2xl font-black text-white mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-300 italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded text-sm font-mono border border-purple-700/50">$1</code>')
      .replace(/^>\s(.+)$/gm, '<blockquote class="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-900/20 rounded-r-lg text-gray-300 italic">$1</blockquote>')
      .replace(/^\| (.+) \|$/gm, (match) => {
        const cells = match.split("|").filter(c => c.trim() && !c.match(/^[-\s]+$/));
        if (cells.length === 0) return match;
        return `<tr class="border-b border-white/5">${cells.map(c => `<td class="px-3 py-2 text-sm text-gray-300">${c.trim()}</td>`).join("")}</tr>`;
      })
      .replace(/^[-*] (.+)$/gm, '<li class="flex items-start gap-2 text-gray-300 my-1"><span class="text-purple-400 mt-1 flex-shrink-0">•</span><span>$1</span></li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="flex items-start gap-2 text-gray-300 my-1"><span class="text-purple-400 font-bold mt-0 flex-shrink-0">→</span><span>$1</span></li>')
      .replace(/\n\n/g, '</p><p class="text-gray-400 leading-relaxed my-3">')
      .replace(/^(.+)$/gm, (line) => {
        if (line.startsWith('<')) return line;
        return line;
      });
  }

  if (loading) return <LoadingScreen />;
  if (!article) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white gap-4">
      <div className="text-5xl">😕</div>
      <p className="text-xl">Artigo não encontrado</p>
      <Link to={createPageUrl("Home")} className="text-purple-400 hover:text-purple-300">← Voltar ao início</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* BARRA DE PROGRESSO DE LEITURA */}
      <div className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 transition-all duration-150"
        style={{ width: `${readProgress}%` }} />

      {/* HEADER STICKY */}
      <div className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link to={category ? createPageUrl("Category") + `?id=${category.id}` : createPageUrl("Home")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group flex-shrink-0">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">{category?.name || "Voltar"}</span>
          </Link>
          <p className="text-gray-400 text-sm truncate flex-1 text-center hidden md:block">{article.title}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition">
              {copied ? <><Check className="w-4 h-4 text-green-400" /><span className="hidden sm:inline">Copiado!</span></> : <><Share2 className="w-4 h-4" /><span className="hidden sm:inline">Compartilhar</span></>}
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition print:hidden">
              <Printer className="w-4 h-4" /><span className="hidden sm:inline">Imprimir</span>
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-sm transition print:hidden">
              <Download className="w-4 h-4" /><span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* META DO ARTIGO */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {category && (
              <Link to={createPageUrl("Category") + `?id=${category.id}`}
                className="text-sm px-3 py-1 rounded-full font-semibold transition hover:scale-105"
                style={{ background: `${category.color}33`, color: category.color }}>
                {category.name}
              </Link>
            )}
            <span className="text-xs bg-white/5 text-gray-400 px-3 py-1 rounded-full">{article.difficulty}</span>
            {article.featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full font-bold">⭐ Destaque</span>}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{article.title}</h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">{article.summary}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 pb-6 border-b border-white/10">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />{article.reading_time} min de leitura</span>
            <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-green-400" />{article.views?.toLocaleString()} visualizações</span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400 font-bold">{article.average_rating?.toFixed(1)}</span>
              <span>({article.total_ratings} avaliações)</span>
            </span>
          </div>

          {/* TAGS */}
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {article.tags.map(t => (
                <span key={t} className="text-xs bg-white/5 text-gray-500 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition cursor-default">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CONTEÚDO */}
        <article ref={articleRef} className="prose-custom mb-12">
          <div className="bg-white/3 rounded-2xl p-6 md:p-8 border border-white/8"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }} />
        </article>

        {/* AVALIAÇÃO */}
        <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-6 border border-purple-500/20 mb-8 text-center">
          <h3 className="text-lg font-bold text-white mb-2">O que achou deste artigo?</h3>
          <p className="text-gray-400 text-sm mb-4">Avalie e ajude outros leitores</p>
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setUserRating(n)}
                className="transition-all hover:scale-125">
                <Star className={`w-8 h-8 transition-colors ${n <= (hoverRating || userRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
              </button>
            ))}
          </div>
          {userRating > 0 && <p className="text-green-400 text-sm">✓ Obrigado pela avaliação!</p>}
        </div>

        {/* AÇÕES */}
        <div className="flex flex-wrap gap-3 mb-12 print:hidden">
          <button onClick={handleShare} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-semibold transition border border-blue-500/30">
            <Share2 className="w-4 h-4" /> Compartilhar artigo
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold transition border border-white/10">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold transition border border-purple-500/30">
            <Download className="w-4 h-4" /> Salvar em PDF
          </button>
        </div>

        {/* COMENTÁRIOS */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Comentários ({comments.length})</h2>
          </div>

          {comments.length > 0 ? (
            <div className="space-y-4 mb-8">
              {comments.map(c => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                        {c.author_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{c.author_name}</p>
                        <p className="text-xs text-gray-500">{new Date(c.created_date).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= c.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600 mb-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Seja o primeiro a comentar!</p>
            </div>
          )}

          {/* FORM DE COMENTÁRIO */}
          {submitted ? (
            <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
              <p className="text-green-300 font-semibold">Comentário enviado com sucesso!</p>
              <p className="text-gray-500 text-sm mt-1">Obrigado pela sua contribuição!</p>
            </div>
          ) : (
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Deixar comentário</h3>
              <form onSubmit={submitComment} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Seu nome *</label>
                    <input value={commentForm.author_name} onChange={e => setCommentForm({ ...commentForm, author_name: e.target.value })} required
                      placeholder="Ex: João Silva"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-sm transition" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">E-mail (opcional)</label>
                    <input value={commentForm.author_email} onChange={e => setCommentForm({ ...commentForm, author_email: e.target.value })}
                      placeholder="seu@email.com" type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-sm transition" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Sua avaliação</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setCommentForm({ ...commentForm, rating: n })}
                        className="transition hover:scale-110">
                        <Star className={`w-6 h-6 ${n <= commentForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Comentário *</label>
                  <textarea value={commentForm.content} onChange={e => setCommentForm({ ...commentForm, content: e.target.value })} required
                    placeholder="Compartilhe sua opinião, dúvida ou experiência..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 text-sm transition resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {submitting ? "Enviando..." : "Publicar comentário"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ARTIGOS RELACIONADOS */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">📚 Artigos relacionados</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map(a => (
                <Link key={a.id} to={createPageUrl("Article") + `?slug=${a.slug}`}
                  className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer block">
                  <h3 className="font-semibold text-white text-sm leading-snug mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">{a.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.reading_time} min</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{a.average_rating?.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-gray-950 { background: white !important; }
          h1, h2, h3 { color: black !important; }
          p, li { color: #333 !important; }
          .border { border-color: #ddd !important; }
        }
        .prose-custom h2 { color: #c4b5fd; font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .prose-custom h3 { color: white; font-size: 1.1rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .prose-custom p { color: #9ca3af; line-height: 1.8; margin: 0.75rem 0; }
        .prose-custom ul, .prose-custom ol { padding-left: 0; }
        .prose-custom li { display: flex; align-items: flex-start; gap: 0.5rem; color: #d1d5db; margin: 0.4rem 0; }
        .prose-custom table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .prose-custom tr { border-bottom: 1px solid rgba(255,255,255,0.05); }
        .prose-custom td, .prose-custom th { padding: 0.6rem 0.75rem; font-size: 0.875rem; color: #d1d5db; text-align: left; }
        .prose-custom blockquote { border-left: 4px solid #8b5cf6; padding: 0.75rem 1rem; margin: 1.5rem 0; background: rgba(139,92,246,0.1); border-radius: 0 0.5rem 0.5rem 0; color: #d1d5db; font-style: italic; }
        .prose-custom code { background: rgba(139,92,246,0.2); color: #c4b5fd; padding: 0.15rem 0.4rem; border-radius: 0.25rem; font-size: 0.85rem; font-family: monospace; border: 1px solid rgba(139,92,246,0.3); }
        .prose-custom strong { color: white; font-weight: 700; }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
