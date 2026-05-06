# Modifications

Généralisation des méthodes de l'IA → plus de nom Mistral dans les méthodes

Réfactorisation des fichiers ; plus de logique dans les méthodes liés aux services, moins de propagation des fichiers inutiles

```
AIModule
  ├── AIController          ← injecte uniquement AIService
  ├── AIService             ← point d'entrée unique pour toute l'IA
  │     ├── generateText(prompt)
  │     ├── analyzeDocument(file)         ← ex-DocumentService
  │     └── generateTextFromWebContent(url)  ← ex-DocumentService + ScrappingService
  ├── ScrappingService      ← utilitaire privé, plus d'injection AI_PROVIDER
  ├── PromptService
  └── AIProviderFactory

  [supprimé] DocumentService
```

