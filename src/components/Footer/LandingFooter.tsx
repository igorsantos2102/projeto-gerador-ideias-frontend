import { AppFooter } from "./AppFooter";
import githubIcon from '@/assets/githubMark/github-mark.png'
import creaitorName from '@/assets/CriaitorAssets/NOME PRETO - SEM FUNDO.png';

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:justify-between">
        
        {/* Brand e Contexto */}
        <div className="max-w-sm">
          <img src={creaitorName} alt="Logo do Criaitor" className="mt-3 h-10 w-auto object-contain md:h-12" />
          <p className="mt-2 text-lg font-semibold text-foreground">Criaitor</p>

          <p className="mt-2 text-sm text-muted-foreground">
            Aplicação web desenvolvida pelo time Acelera Maker da Montreal para geração de ideias criativas com IA local (Ollama).
          </p>
        </div>
        
        {/* Funcionalidades */}
        <div>
          <h3 className="text-sm font-semibold">Funcionalidades</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Geração de ideias criativas</li>
            <li>Histórico com filtros</li>
            <li>Favoritos</li>
            <li>Estatísticas de uso</li>
          </ul>
        </div>

        {/* Recursos do projeto */}
        <div>
          <h3 className="text-sm font-semibold">Recursos do projeto</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Documentação da sprint</li>
            <li>Cache local no banco</li>
            <li className="italic text-xs">Termos/Políticas: to be defined</li>
          </ul>

          {/* Repositórios */}
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-semibold">Repositórios</h4>
            <a
              href="https://github.com/SEU-USUARIO/seu-frontend"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              target="_blank"
              rel="noreferrer"
            >
              <img src={githubIcon} alt="GitHub" className="h-4 w-4" />
              <span>Frontend</span>
            </a>
            <a
              href="https://github.com/SEU-USUARIO/seu-backend"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              target="_blank"
              rel="noreferrer"
            >
              <img src={githubIcon} alt="GitHub" className="h-4 w-4" />
              <span>Backend</span>
            </a>
          </div>
        </div>
      </div>

      <AppFooter forceLightMode />
    </footer>
  );
}
