# Validação da versão local de teste

Data: 17/10/2026.

## Executado e aprovado

- `npm test`: 8 testes de sintaxe e regressão, incluindo migração, backup, falha de armazenamento, coleta de XP, duração de poderes, pausa e recompensas.
- `npm run build`: pacote estático gerado em `dist`.
- `$env:PLAYWRIGHT_CHANNEL='msedge'; npx playwright test`: 2 testes no Edge headless, 1280×720.
- Navegador: início de partida, coleta sem duplicação, pausa do magnetismo/escudo, recompensa direta de chefe, encerramento idempotente, reabertura e migração de dados antigos.
- `git diff --check`: sem erros de whitespace.

Os testes de navegador controlam o estado por JavaScript: a morte do chefe e o encerramento são simulados, não representam uma partida completa jogada. O navegador não apresentou exceções no primeiro cenário. O servidor retornou 404 apenas para o favicon ausente.

## Pendente antes de aprovar produção

- Jogar uma partida completa de 10 minutos, com derrota e vitória em execuções separadas.
- Validar todas as classes, armas, relíquias, evolução e chefes.
- Comprar nas duas lojas e conferir saldo compartilhado e melhorias na próxima partida.
- Conferir balanceamento após unificação das moedas e timers.
- Verificar interface em outras resoluções e desempenho com muitos inimigos.
- Validar áudio, controles, perda de foco e reinício manual.
- Configurar repositório e hospedagem; executar Actions no GitHub e validar endereço de teste.
- Receber confirmação explícita do usuário para promover o commit aprovado.

Produção não foi publicada. O workflow gera artefato, não um endereço hospedado.
