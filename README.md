# Diário de Bordo

App PWA offline-first para registrar e gerenciar atividades.

## Recursos

- Funciona 100% offline (Service Worker)
- Instalável em celular/desktop (PWA)
- Dados salvos localmente (localStorage)
- Otimizado para performance
- Interface responsiva

### Instalar como app

1. Chrome → Menu (⋮) → "Instalar app"
2. Pronto! Funciona offline

## Performance

| Métrica | Antes   | Depois | Melhoria |
| ------- | ------- | ------ | -------- |
| **LCP** | 2.67s   | 1.04s  | ↓ 61%    |
| **CLS** | 0.55    | 0      | ↓ 100%   |
| **INP** | 1,896ms | 16ms   | ↓ 99%    |
| **FCP** | ~1.2s   | ~0.6s  | ↓ 50%    |

## Otimizações

- Preload de imagem LCP
- Width/Height explícitos (evita CLS)
- CSS crítico inline
- Imagens responsivas (WebP)
- Minificação CSS/JS
- Service Worker resiliente

## Estrutura

├── index.html
├── manifest.json
├── service-worker.js
├── styles.min.css
├── script.min.js
├── icons/
└── README.md
