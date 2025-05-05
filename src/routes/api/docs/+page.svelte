<script>
  import { onMount } from 'svelte';
  import SwaggerUI from 'swagger-ui';
  import 'swagger-ui/dist/swagger-ui.css';
  import { theme } from '$lib/stores/theme';

  let swaggerContainer;
  let currentThemeClass = '';

  onMount(() => {
    SwaggerUI({
      dom_id: '#swagger-ui',
      url: '/api/docs/swagger.json',
      deepLinking: true,
      presets: [
        SwaggerUI.presets.apis
      ],
      syntaxHighlight: {
        theme: 'agate'
      }
    });

    // Detectar el tema real que se aplica cuando está en "system"
    if (typeof window !== 'undefined') {
      // Determinar si el tema del sistema es oscuro
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Actualizar la clase cuando cambie el tema
      const updateThemeClass = () => {
        if ($theme === 'system') {
          currentThemeClass = systemIsDark ? 'dark-theme' : 'light-theme';
        } else {
          currentThemeClass = `${$theme}-theme`;
        }
      };
      
      // Inicializar
      updateThemeClass();
      
      // Suscribirse a cambios en el tema
      theme.subscribe(updateThemeClass);
      
      // Observar cambios en las preferencias del sistema
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if ($theme === 'system') {
          currentThemeClass = e.matches ? 'dark-theme' : 'light-theme';
        }
      });
    }
  });
</script>

<svelte:head>
  <title>API Documentation</title>
</svelte:head>

<div class="swagger-page">
  <div class="swagger-header">
    <h1>API Documentation</h1>
  </div>
  <div class="swagger-wrapper {currentThemeClass || `${$theme}-theme`}">
    <div id="swagger-ui" bind:this={swaggerContainer}></div>
  </div>
</div>

<style>
  .swagger-page {
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--background-color);
  }
  
  .swagger-header {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--header-bg);
    border-bottom: 1px solid var(--border-color);
  }
  
  .swagger-header h1 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.5rem;
  }
  
  .swagger-wrapper {
    flex: 1;
    overflow: auto;
  }
  
  /* Estilos específicos para theme claro */
  .light-theme :global(.swagger-ui) {
    color: #333;
  }
  
  .light-theme :global(.swagger-ui .info .title) {
    color: var(--text-color);
  }
  
  .light-theme :global(.swagger-ui .opblock-tag) {
    color: var(--text-color);
  }
  
  .light-theme :global(.swagger-ui .opblock) {
    border: 1px solid var(--border-color);
    background: var(--card-bg);
  }
  
  .light-theme :global(.swagger-ui .opblock .opblock-summary-method) {
    background: var(--primary-color);
  }
  
  .light-theme :global(.swagger-ui .btn.execute) {
    background-color: var(--primary-color);
  }
  
  .light-theme :global(.swagger-ui .btn.execute:hover) {
    background-color: var(--primary-hover);
  }
  
  /* Estilos específicos para theme oscuro */
  .dark-theme :global(body) {
    background-color: var(--background-color);
  }
  
  .dark-theme :global(.swagger-ui) {
    color: var(--text-color);
  }
  
  .dark-theme :global(.swagger-ui .info) {
    background-color: #2d2d2d;
    color: #eee;
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .scheme-container) {
    background-color: #2d2d2d;
    color: #eee;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,.15);
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .opblock-tag) {
    color: #eee;
    border-bottom: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .opblock-tag:hover) {
    background-color: #383838;
  }
  
  .dark-theme :global(.swagger-ui .opblock) {
    background-color: #2d2d2d;
    border: 1px solid #444;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,.15);
    margin-bottom: 10px;
  }
  
  .dark-theme :global(.swagger-ui .info .title) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .tab li) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui table thead tr td) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui table thead tr th) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .responses-inner h4) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .opblock-section-header h4) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .opblock .opblock-section-header) {
    background-color: transparent;
    color: #eee;
    border-bottom: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .opblock .opblock-summary) {
    border-bottom: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .opblock .opblock-summary-path) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .opblock-description-wrapper) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .opblock-external-docs-wrapper) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .opblock-title_normal) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .response-col_status) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .response-col_description) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .model) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .model-title) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .model-box) {
    background-color: #2d2d2d;
    color: #ccc;
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .parameter__name) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .parameter__type) {
    color: #999;
  }
  
  .dark-theme :global(.swagger-ui .response-control-media-type__title) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui .renderedMarkdown p) {
    color: #ccc;
  }
  
  .dark-theme :global(.swagger-ui input[type=email]),
  .dark-theme :global(.swagger-ui input[type=file]),
  .dark-theme :global(.swagger-ui input[type=password]),
  .dark-theme :global(.swagger-ui input[type=search]),
  .dark-theme :global(.swagger-ui input[type=text]),
  .dark-theme :global(.swagger-ui textarea) {
    background-color: #333;
    color: #eee;
    border: 1px solid #555;
  }
  
  .dark-theme :global(.swagger-ui select) {
    background-color: #333;
    color: #eee;
    border: 1px solid #555;
  }
  
  .dark-theme :global(.swagger-ui .opblock-body pre.microlight) {
    background-color: #222;
    color: #f0f0f0;
    border-radius: 4px;
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui textarea.curl) {
    background-color: #222;
    color: #f0f0f0;
    border-radius: 4px;
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui section.models) {
    background-color: #2d2d2d;
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui section.models.is-open h4) {
    color: #eee;
    border-bottom: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .btn) {
    box-shadow: 0 1px 2px rgba(0,0,0,.1);
  }
  
  .dark-theme :global(.swagger-ui .btn.cancel) {
    background-color: #444;
    color: #eee;
    border-color: #555;
  }
  
  .dark-theme :global(.swagger-ui .btn.execute) {
    background-color: var(--primary-color);
    color: #fff;
  }
  
  .dark-theme :global(.swagger-ui .btn.authorize) {
    background-color: var(--primary-color);
    color: #fff;
  }
  
  .dark-theme :global(.swagger-ui .btn.authorize svg) {
    fill: #fff;
  }
  
  .dark-theme :global(.swagger-ui .topbar) {
    background-color: #222;
  }
  
  .dark-theme :global(.swagger-ui .topbar .download-url-wrapper .select-label select) {
    background-color: #333;
    color: #eee;
    border: 1px solid #555;
  }
  
  .dark-theme :global(.swagger-ui .dialog-ux .modal-ux) {
    background-color: #2d2d2d;
    border: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .dialog-ux .modal-ux-header h3) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .dialog-ux .modal-ux-content) {
    background-color: #2d2d2d;
  }
  
  .dark-theme :global(.swagger-ui .dialog-ux .modal-ux-header) {
    border-bottom: 1px solid #444;
  }
  
  .dark-theme :global(.swagger-ui .scopes__title) {
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .markdown code), 
  .dark-theme :global(.swagger-ui .renderedMarkdown code) {
    background-color: rgba(255,255,255,.1);
    color: #eee;
  }
  
  .dark-theme :global(.swagger-ui .opblock.opblock-get) {
    border-color: #3b4151;
    background: rgba(97,175,254,.1);
  }
  
  .dark-theme :global(.swagger-ui .opblock.opblock-post) {
    border-color: #3b4151;
    background: rgba(73,204,144,.1);
  }
  
  .dark-theme :global(.swagger-ui .opblock.opblock-delete) {
    border-color: #3b4151;
    background: rgba(249,62,62,.1);
  }
  
  .dark-theme :global(.swagger-ui .opblock.opblock-put) {
    border-color: #3b4151;
    background: rgba(252,161,48,.1);
  }
  
  /* system theme hereda los estilos del tema actual aplicado */
  .system-theme :global(.swagger-ui) {
    color: var(--text-color);
  }
  
  /* Responsive styles for API docs */
  @media (max-width: 768px) {
    .api-docs-container {
      padding: 12px;
    }
    
    :global(.swagger-ui .wrapper) {
      padding: 0;
    }
    
    :global(.swagger-ui .opblock .opblock-summary) {
      padding: 8px;
    }
    
    :global(.swagger-ui .btn) {
      padding: 6px 8px;
    }
  }
  
  @media (max-width: 480px) {
    :global(.swagger-ui .opblock-tag) {
      font-size: 18px;
      padding: 8px 0;
    }
    
    :global(.swagger-ui .opblock .opblock-summary-method) {
      min-width: 60px;
      font-size: 12px;
    }
    
    :global(.swagger-ui .opblock .opblock-summary-path) {
      font-size: 12px;
    }
    
    :global(.swagger-ui table) {
      font-size: 12px;
    }
    
    :global(.swagger-ui .parameters-container .parameters th) {
      padding: 6px;
    }
    
    :global(.swagger-ui .parameters-container .parameters td) {
      padding: 6px;
    }
  }
</style> 