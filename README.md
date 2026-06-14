# 🚀 TechFácil — Portal de Tecnologia & Educação Digital

> Portal gratuito com dicas, tutoriais, atalhos e novidades de tecnologia para o dia a dia.

![TechFácil](https://img.shields.io/badge/TechF%C3%A1cil-Tecnologia%20para%20todos-purple?style=for-the-badge)
![Gratuito](https://img.shields.io/badge/100%25-Gratuito-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)

---

## 📋 Sobre o Projeto

O **TechFácil** é um portal de tecnologia e educação digital completo, construído com React e hospedado na plataforma Base44. O objetivo é facilitar a vida das pessoas com conteúdo prático, acessível e gratuito.

## ✨ Funcionalidades

- 🔍 **Busca ao vivo** — resultados em tempo real enquanto digita
- 🗂️ **Mega Menu animado** com categorias e subcategorias
- 📱 **100% responsivo** — funciona no celular e no PC
- ⭐ **Avaliação por estrelas** em cada artigo
- 💬 **Sistema de comentários** completo
- 📄 **Salvar em PDF** / Imprimir / Compartilhar
- 📊 **Barra de progresso de leitura**
- 🏆 **Ranking dos artigos mais vistos**
- 🌱 **Filtro por nível** (Iniciante, Intermediário, Avançado)
- 🎡 **Hero rotativo** com artigos em destaque

## 📂 Categorias

| Categoria | Cor | Descrição |
|-----------|-----|-----------|
| 🛡️ Segurança Digital | Vermelho | Senhas, phishing, VPN, privacidade |
| 📱 Tutoriais de Apps | Azul | WhatsApp, Google, Drive, Notion |
| ⚡ Novidades Tech | Âmbar | IA, gadgets, tendências |
| ⚙️ Truques de Sistema | Violeta | Windows, Android, iOS |
| ⌨️ Atalhos & Produtividade | Esmeralda | Windows, Chrome, Excel |
| 📚 Educação Digital | Rosa | Cursos, programação, IA na educação |

## 🗂️ Estrutura do Projeto

```
techfacil-portal/
├── pages/
│   ├── Home.jsx          # Página inicial com hero, busca, destaques
│   ├── Category.jsx      # Listagem por categoria com filtros
│   ├── Article.jsx       # Artigo completo com comentários e PDF
│   ├── Articles.jsx      # Todos os artigos com busca e filtros
│   ├── Layout.jsx        # Navbar + mega menu + footer
│   └── index.js          # Exportações
├── entities/
│   ├── Category.json     # Schema de categorias
│   ├── Subcategory.json  # Schema de subcategorias
│   ├── Article.json      # Schema de artigos
│   └── Comment.json      # Schema de comentários
└── README.md
```

## 🛠️ Tecnologias

- **React 18** com hooks
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Base44** como plataforma backend (banco de dados, hosting)
- **React Router** para navegação

## 📄 Páginas

### Home (`/`)
- Hero com artigo rotativo a cada 5 segundos
- Busca ao vivo com dropdown de resultados
- Grade de 6 categorias coloridas e animadas
- Seção de destaques (grid 2x2)
- Ranking dos mais vistos + artigos recentes
- Filtro rápido por nível de dificuldade

### Categoria (`/category?id=...`)
- Header dinâmico com cor da categoria
- Filtros por subcategoria, dificuldade e ordenação
- Cards animados com hover
- Navegação rápida para outras categorias

### Artigo (`/article?slug=...`)
- Barra de progresso de leitura no topo
- Navbar sticky com botões de ação
- Conteúdo em Markdown renderizado
- Sistema de avaliação com estrelas
- Comentários + formulário
- Botões: Compartilhar | Imprimir | Salvar PDF
- Artigos relacionados

### Todos os Artigos (`/articles`)
- Busca + filtro por categoria + filtro por nível
- Ordenação por popularidade, avaliação ou data

## 🚀 Como usar

Este projeto foi desenvolvido na plataforma **Base44**. Para rodar localmente ou adaptar:

1. Clone o repositório
2. As páginas JSX podem ser adaptadas para qualquer projeto React
3. Substitua as importações `@/api/entities` pelo seu backend preferido

## 📝 Licença

MIT — use à vontade! 💜

---

Feito com ❤️ para facilitar sua vida digital.
