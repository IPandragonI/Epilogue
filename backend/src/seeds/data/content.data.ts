import { PlatformEnum } from '../../modules/content-idea/entities/platform.enum';
import { ContentStatusEnum } from '../../modules/content/entities/contentStatus.enum';

export const contentData = () => [
  {
    title: 'Comment optimiser son SEO en 2026',
    body: 'Le SEO a radicalement changé avec l’arrivée des moteurs de recherche basés sur l’IA...',
    contentPlatform: PlatformEnum.BLOG,
    status: ContentStatusEnum.PUBLISHED,
    publishedDate: new Date('2026-01-15'),
    seo: {
      score: 95,
      keywords: 'SEO 2026, IA, optimisation sémantique, Google Search',
      review: 'Excellent usage des mots-clés de longue traine et structure de balisage parfaite.',
    },
  },
  {
    title: 'Les secrets d’un post LinkedIn viral',
    body: 'Pourquoi certains posts atteignent 100k vues et d’autres seulement 10 ? Voici le framework...',
    contentPlatform: PlatformEnum.LINKEDIN,
    status: ContentStatusEnum.PUBLISHED,
    publishedDate: new Date('2026-02-10'),
    seo: {
      score: 45,
      keywords: 'LinkedIn, personal branding, algorithme, visibilité',
      review: 'Le score est bas car le contenu mise sur le social. Manque de densité de mots-clés techniques.',
    },
  },
  {
    title: 'Guide complet sur NestJS et TypeORM',
    body: 'Apprendre à gérer les relations One-to-One et les seeders modulaires dans un projet NestJS...',
    contentPlatform: PlatformEnum.BLOG,
    status: ContentStatusEnum.DRAFT,
    publishedDate: null,
    seo: {
      score: 78,
      keywords: 'NestJS, TypeORM, TypeScript, Backend, Seeding',
      review: 'Bonne base technique. Devrait inclure plus de liens internes pour dépasser les 85 points.',
    },
  },
  {
    title: 'L’impact de la vidéo courte sur le SEO local',
    body: 'Les Reels et TikTok apparaissent désormais dans les résultats de recherche locaux...',
    contentPlatform: PlatformEnum.INSTAGRAM,
    status: ContentStatusEnum.PUBLISHED,
    publishedDate: new Date('2026-03-05'),
    seo: {
      score: 62,
      keywords: 'SEO local, Reels, TikTok marketing, visibilité Google',
      review: 'Optimisation correcte pour les réseaux sociaux mais nécessite des sous-titres textuels pour Google.',
    },
  },
  {
    title: 'Pourquoi l’IA ne remplacera pas les rédacteurs SEO',
    body: 'L’empathie humaine et l’expérience vécue (E-E-A-T) restent les piliers du contenu de qualité...',
    contentPlatform: PlatformEnum.BLOG,
    status: ContentStatusEnum.PUBLISHED,
    publishedDate: new Date('2025-12-01'),
    seo: {
      score: 88,
      keywords: 'E-E-A-T, rédaction web, IA vs Humain, stratégie de contenu',
      review: 'Très bon score. L’article est bien structuré avec des balises H1-H3 optimisées.',
    },
  },
  {
    title: 'Le futur du Search : De Google à ChatGPT',
    body: 'L’utilisateur ne cherche plus des liens, il cherche des réponses directes. Voici comment s’adapter.',
    contentPlatform: PlatformEnum.TWITTER,
    status: ContentStatusEnum.PUBLISHED,
    publishedDate: new Date(),
    seo: {
      score: 30,
      keywords: 'Search Generative Experience, SGE, ChatGPT, futur du web',
      review: 'Format trop court pour un référencement classique, mais fort potentiel de trafic referral.',
    },
  },
  {
    title: 'Optimiser la vitesse de chargement (Core Web Vitals)',
    body: 'Le LCP et le CLS expliqués simplement pour les développeurs front-end...',
    contentPlatform: PlatformEnum.BLOG,
    status: ContentStatusEnum.DRAFT,
    publishedDate: null,
    seo: {
      score: 15,
      keywords: 'Core Web Vitals, LCP, Performance Web',
      review: 'Contenu trop maigre pour l’instant. Crawl impossible par les moteurs.',
    },
  },
];
