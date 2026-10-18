# Rollback — refinamento de posicionamento

Estado preservado antes das mudanças de 17/10/2026:

- Repositório: onstandbyx-png/portifolio
- SHA: b3e5a8bee099c5a74bd935b356316d84dd5e2cbf
- Branch remota: rollback/portfolio-before-positioning-20261017-b3e5a8b
- Serviço Railway: portfolio-visual-review (fe0ac14d-bcc6-4b55-8aa5-e145e17ad575)
- Projeto: 37e7ee38-07a0-4123-a503-5121522bd829
- Ambiente: b801a6ce-a4bc-4728-b266-e08d05ab0a1b
- Deploy anterior: 599b300d-f7d0-469a-a98e-b6cfc7e64135 (SUCCESS; canRollback=true na inspeção).
- Snapshot Railway: bb57b08f-1b22-4185-a3fe-cc400e6d095d
- Branch de publicação: feat/portfolio-reference-recovery-20261015
- URL: https://portfolio-visual-review-production.up.railway.app/

## Retorno

Restaurar o deploy acima pelo Railway, se ainda disponível. Alternativa durável: usar a branch de rollback como source do mesmo serviço, revisar apenas essa alteração e publicar. A branch conserva código, assets e lockfile originais. Não usar reset/force-push na branch compartilhada.

As alterações locais da cópia antiga em outra pasta não foram incorporadas nem descartadas.
