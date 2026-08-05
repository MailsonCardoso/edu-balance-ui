# Workflow obrigatório ao finalizar qualquer tarefa

Sempre que concluir uma alteração de código, executar nesta ordem:

1. **Build**: `npm run build` (deve passar sem erros)
2. **Versionamento**: bump em `package.json` e criar tag `v<X.Y.Z>` seguindo o padrão semântico (patch para fix, minor para feat). Ex.: se a última tag é `v2.3.2`, a próxima é `v2.3.3` ou `v2.4.0` conforme o tipo da mudança.
3. **Commit**: mensagem em português, estilo conventional commits (ex.: `fix: ...`, `feat: ...`), seguindo o histórico do repo.
4. **Push**: `git push origin main --tags`

Não esquecer de incluir a tag no push. O usuário quer build, versionamento e push SEMPRE, em todas as tarefas.
