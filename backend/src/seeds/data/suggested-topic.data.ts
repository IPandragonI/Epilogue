import { PlatformEnum } from '../../modules/suggested-topic/entities/platform.enum';

const BASE_SUGGESTED_TOPICS = [
  {
    topic: 'Le SEO en 2026 : Ce qui fonctionne vraiment',
    topicDescription:
      'Le referencement evolue rapidement. Decouvrez les strategies SEO reellement efficaces en 2026 pour ameliorer votre visibilite, attirer du trafic qualifie et rester competitif.',
    recommendedPlatform: PlatformEnum.BLOG,
  },
  {
    topic: 'Les erreurs SEO qui ruinent votre site',
    topicDescription:
      "Beaucoup de sites perdent du trafic a cause d'erreurs SEO evitables. Cet article revele les pieges courants et comment les corriger pour ameliorer votre classement.",
    recommendedPlatform: PlatformEnum.INSTAGRAM,
  },
  {
    topic: 'SEO pour debutants : Le guide essentiel',
    topicDescription:
      'Apprenez les bases du referencement naturel : mots-cles, optimisation technique, contenu et liens. Un guide simple pour comprendre le SEO et ameliorer votre site.',
    recommendedPlatform: PlatformEnum.BLOG,
  },
  {
    topic: 'Comment trouver les bons mots-cles pour votre SEO',
    topicDescription:
      'Trouver les bons mots-cles est crucial pour le SEO. Decouvrez des methodes simples et des outils efficaces pour cibler les recherches qui apportent vraiment du trafic.',
    recommendedPlatform: PlatformEnum.INSTAGRAM,
  },
  {
    topic: 'SEO et contenu : la strategie gagnante pour 2026',
    topicDescription:
      'Le contenu reste au coeur du SEO. Apprenez comment creer des articles optimises, utiles et engageants qui plaisent aux lecteurs et aux moteurs de recherche.',
    recommendedPlatform: PlatformEnum.BLOG,
  },
  {
    topic: 'SEO technique : Les bases a maitriser',
    topicDescription:
      'Vitesse, structure, indexation, balises. Cet article explique les elements techniques essentiels du SEO pour rendre votre site plus performant et visible sur Google.',
    recommendedPlatform: PlatformEnum.LINKEDIN,
  },
  {
    topic: "Comment l'IA transforme le SEO en 2026",
    topicDescription:
      "L'intelligence artificielle redefinit les regles du referencement. Explorez comment Google SGE et les LLMs changent la facon dont les contenus sont indexes et decouverts.",
    recommendedPlatform: PlatformEnum.BLOG,
  },
  {
    topic: '5 astuces pour booster son score SEO',
    topicDescription:
      'Des conseils concrets et actionnables pour ameliorer rapidement votre positionnement sur Google et attirer un trafic plus qualifie vers votre site.',
    recommendedPlatform: PlatformEnum.LINKEDIN,
  },
  {
    topic: 'Pourquoi votre blog stagne (et comment y remedier)',
    topicDescription:
      'Manque de regularite, contenu generique, mauvais mots-cles... Identifiez les raisons qui bloquent la croissance de votre blog et les solutions pour en sortir.',
    recommendedPlatform: PlatformEnum.INSTAGRAM,
  },
  {
    topic: 'Rediger pour les humains ET pour Google',
    topicDescription:
      "Le meilleur contenu SEO n'est pas celui qui triche avec les algorithmes, mais celui qui repond vraiment aux questions des utilisateurs. Voici comment trouver l'equilibre.",
    recommendedPlatform: PlatformEnum.BLOG,
  },
  {
    topic: 'Calendrier editorial SEO : le guide complet',
    topicDescription:
      "Planifier son contenu a l'avance est la cle d'une strategie SEO coherente. Decouvrez comment structurer votre calendrier pour maximiser votre impact organique.",
    recommendedPlatform: PlatformEnum.LINKEDIN,
  },
  {
    topic: 'Les outils IA indispensables pour creer du contenu',
    topicDescription:
      'ChatGPT, Perplexity, Jasper... Tour dhorizon des meilleurs outils IA pour accelerer la creation de contenu SEO sans sacrifier la qualite.',
    recommendedPlatform: PlatformEnum.INSTAGRAM,
  },
];

export const suggestedTopicData = (userId: string) =>
  BASE_SUGGESTED_TOPICS.map((topic) => ({
    ...topic,
    userId,
  }));

