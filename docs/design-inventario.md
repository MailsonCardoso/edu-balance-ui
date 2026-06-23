# Design Conceitual — Tela de Gestão de Inventário e Controle de Patrimônio

## Decisões de UX Tomadas

| Ponto | Decisão | Justificativa |
|-------|---------|---------------|
| Variação nos cards | ✅ Mostrar seta + percentual (ex: ▲ 5,2%) | Dá contexto temporal sem ocupar espaço extra |
| Alertas Críticos clicável | ✅ Sim, CTA que abre modal "⚠️ Alertas de Auditoria" | Reduz atrito para ação corretiva |
| Valor do card patrimônio | Valor total depreciado contábil (com tooltip mostrando valor original) | Reflete valor real do ativo |
| Busca com autocomplete | ✅ Sim, sugestões em tempo real (Nome, Tag, Série destacados) | Acelera localização em bases grandes |
| Filtros combináveis | ✅ Sim, todos os dropdowns são cumulativos (AND) | Usuário expert precisa de refinamento progressivo |
| Responsável na tabela | Avatar (iniciais) + Nome + Setor abreviado | Scannability máxima alinhada horizontal |
| Valor na tabela | Valor depreciado (tooltip: "Original: R$ X.XXX,00") | Atende contabilidade sem poluir grid |
| Ações extras | 3 ícones visíveis + menu "..." com: Editar, Dar Baixa, Histórico de Movimentações, Anexos | Ações frequentes à vista; raras no overflow |
| Paginação vs Scroll | Paginação clássica (50 por página) com seletor 10/25/50/100 | Controle previsível, evita perda de referência |
| Seleção em lote | ✅ Checkbox na primeira coluna + barra de ações em massa | Essencial para inventário (transferir, exportar, baixar em lote) |
| Perfil principal | Administrador de Patrimônio (secundário: TI, Financeiro) | Determina peso: ações de manutenção e auditoria em destaque |
| Modo escuro | ✅ Suporte nativo (design tokens CSS) | Reduz fadiga ocular em uso prolongado |
| Responsivo | Layout adaptável: >1440px (completo), 1024-1440px (cards empilhados 2x2), <1024px (tabela em cards) | Gestão de inventário é majoritariamente desktop, mas deve ser acessível em tablet |

---

## 1. Estrutura Geral da Tela (Z-Pattern)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔍 Busca Inteligente  │  Categoria ▼  │  Local ▼  │  Status ▼  │
│  (placeholder: "Busque por nome, tag ou série...")                   │
│                                                                      │
│  [+ Cadastrar Ativo]   [📄 Exportar]   [📋 Iniciar Auditoria]        │
├──────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │ 📦 Total │  │ 💰 Valor │  │ 🔧 Manut. │  │ 🚨 Alertas│           │
│  │  1.432   │  │R$2,4M    │  │   23      │  │   7      │            │
│  │ ▲ +3,2%  │  │ ▼ -1,1%  │  │  ▲ +2     │  │  ⚠️ Ver   │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
├──────────────────────────────────────────────────────────────────────┤
│  □  Código/Tag   │  Item          │  Cat/Local       │  Responsável  │
│  ☑  PAT-0492     │  Notebook      │  TI / Sede       │  🧑 Maria    │
│  ☐  PAT-1001     │  Mesa         │  Mobiliário / Filial│  👤 João    │
│  ☐  PAT-2033     │  Furgão       │  Veículos / Sede  │  👤 Carlos   │
│                                                                      │
│  ←  1  2  3  ...  29  →    Exibindo 1-50 de 1.432                  │
├──────────────────────────────────────────────────────────────────────┤
│  Ações em Massa: [Transferir] [Exportar Selecionados] [Gerar Etiquetas]│
│  Legenda: ● Ativo ● Manutenção ● Baixado ● Emprestado               │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detalhamento por Seção

### 2.1 Header — Busca Inteligente + Filtros

**Comportamento da Busca:**
- Input com **debounce de 300ms**
- **Autocomplete** exibe um dropdown estilizado com 3 seções:
  ```
  ┌─────────────────────────────────────┐
  │  notebook                           │
  │ ──── Itens ───────────────────────── │
  │  📷 Notebook Dell Latitude 3540     │
  │  📷 Notebook Lenovo ThinkPad X1     │
  │ ──── Tags Patrimoniais ───────────── │
  │  🔖 PAT-0492  → Notebook Dell       │
  │  🔖 PAT-1001  → Mesa Executiva      │
  │ ──── Nº de Série ─────────────────── │
  │  🔢 SN-2024-8842 → Notebook Dell    │
  └─────────────────────────────────────┘
  ```
- Ao pressionar Enter, aplica o filtro + **highlight** no termo buscado na tabela

**Filtros Rápidos:**
- Dropdowns estilizados com **multi-select + busca interna**
- Badge de contagem no label: `Categoria (3)`
- Botão "Limpar Filtros" só aparece quando há filtro ativo
- Persistência dos filtros em URL params (compartilhável)

**Botões de Ação Global:**
| Botão | Cor | Ícone | Atalho | Comportamento |
|-------|-----|-------|--------|---------------|
| Cadastrar Ativo | Primary (Azul 600) | + | `C` | Abre modal lateral (drawer) com formulário |
| Exportar | Outline | 📄 | `Ctrl+E` | Dropdown: "Exportar como XLSX" | "Exportar como PDF" | "Exportar como CSV" |
| Iniciar Auditoria | Secondary (Laranja 600) | 📋 | `Ctrl+I` | Abre wizard de auditoria (selecionar lote, período, responsável) |

---

### 2.2 Cards de Resumo (KPI Cards)

**Layout:** 4 cards em grid, cada um com:
- Ícone (24px) + Label + Valor principal (bold, 28px) + Variação (tag 16px)

**Cards:**

| Card | Ícone | Cor da borda/acento | Conteúdo do Tooltip | Ação ao clicar |
|------|-------|---------------------|---------------------|----------------|
| Total de Itens | 📦 | Azul | "Itens ativos + inativos" | Nenhuma (já está na tela cheia) |
| Valor do Patrimônio | 💰 | Verde | "Original: R$ 3.200.000,00 · Depreciado: R$ 2.412.000,00" | Abre gráfico "Evolução Patrimonial" (modal) |
| Em Manutenção | 🔧 | Amarelo | "23 itens em reparo · 8 há mais de 30 dias" | Aplica filtro Status = Em Manutenção |
| Alertas Críticos | 🚨 | Vermelho | "3 sem auditoria há 12+ meses · 4 com vida útil expirada" | Abre modal "⚠️ Alertas de Auditoria" com lista priorizada |

**Microinterações:**
- Cards têm **elevação sutil** (box-shadow) e sobem 2px no hover
- Badge de variação: fundo verde claro para ▲, vermelho claro para ▼
- Valor em reais formatado: `R$ 2.412.000` (milhar com ponto, sem decimais)

---

### 2.3 Tabela de Ativos

#### Colunas (larguras fixas em grid)

| Coluna | Largura | Alinhamento | Conteúdo |
|--------|---------|-------------|----------|
| `□` | 40px | Centro | Checkbox de seleção |
| Código/Tag | 120px | Esquerda | `PAT-0492` (monospace) |
| Item | 280px (flex) | Esquerda | Thumb 32x32 + Nome do ativo + Nº de série (linha abaixo, cinza) |
| Categoria / Local | 180px | Esquerda | Badge Categoria + Localização (ex: `TI` `Sede`) |
| Responsável | 160px | Esquerda | Avatar 24px (iniciais) + Nome + `<Setor>` |
| Valor Atualizado | 140px | Direita | `R$ 8.420,00` + tooltip `Original: R$ 12.000,00` |
| Status | 100px | Centro | Badge colorido (verde/amarelo/vermelho/cinza) |
| Ações Rápidas | 140px | Centro | 3 ícones + `⋯` |

#### Badges de Status

| Status | Fundo | Texto | Ícone |
|--------|-------|-------|-------|
| Ativo | Verde 100, texto Verde 800 | ● Ativo | — |
| Em Manutenção | Amarelo 100, texto Amarelo 800 | 🔧 Manutenção | — |
| Baixado | Vermelho 100, texto Vermelho 800 | ✕ Baixado | — |
| Emprestado | Cinza 100, texto Cinza 800 | 🔄 Emprestado | — |

#### Ações Rápidas

| Ação | Ícone | Tooltip | Comportamento |
|------|-------|---------|---------------|
| 👁️ | eye | Visualizar | Abre drawer lateral de detalhes (não modal, mantém contexto) |
| 🔄 | transfer | Transferir | Abre modal "Transferir Responsável" (com busca de pessoa/setor) |
| 🏷️ | printer | Imprimir Etiqueta | Gera PDF da etiqueta com QR Code em nova guia |
| ⋯ | more | Mais ações | Dropdown: Editar, Dar Baixa, Histórico, Anexos, Duplicar |

#### Estados da Tabela

**Empty State (sem ativos cadastrados):**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    📦 Nenhum ativo cadastrado                 │
│          Comece cadastrando seu primeiro item patrimonial    │
│                                                              │
│                 [+ Cadastrar Primeiro Ativo]                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Empty State (busca sem resultados):**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    🔍 Nenhum resultado para "xyz"            │
│     Sugestões: • Verifique a ortografia • Tente termos       │
│     genéricos • Use o número de patrimônio completo          │
│                                                              │
│                    [Limpar Filtros]                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Loading State:**
- **Skeleton loader** com 5 linhas pulsantes (placeholders de mesma geometria das colunas)
- Cards de KPI também entram em skeleton (placeholder de largura variável)

**Error State:**
- Toast de erro no topo: `"❌ Erro ao carregar inventário. Tente novamente."`
- Botão "Tentar novamente" inline
- Tabela mantém último estado válido (se houver)

---

### 2.4 Paginação

```
← Anterior   1  2  3  ...  29  Próximo →    Exibindo 1-50 de 1.432   [50 ▼]
```

- Input editável no número da página (digitar e ir)
- Seletor de itens por página: 10, 25, 50 (padrão), 100
- Contagem total no canto direito

---

### 2.5 Ações em Massa (Barra Flutuante)

Aparece **apenas quando 1+ checkbox está marcado**, com animação slide-up:

```
┌──────────────────────────────────────────────────────────────────────┐
│  3 selecionados  │  [🔄 Transferir]  [📄 Exportar]  [🏷️ Etiquetas] │
│                  │  [📋 Auditorar]  [✕ Baixar em Lote]              │
│  Cancelar        │                                                  │
└──────────────────────────────────────────────────────────────────────┘
```

- Fica fixa no final da viewport
- Ao clicar "Cancelar", desmarca todos os checkboxes

---

## 3. Fluxos de Interação (Micronavegação)

### 3.1 Fluxo: Visualizar Detalhes
```
Clique no ícone 👁️
  → Drawer lateral (480px) abre da direita
  → Animação: slide-in 200ms ease-out
  → Conteúdo em 3 seções: Dados do Ativo | Responsável | Histórico
  → Footer: [Editar] [Transferir] [Imprimir Etiqueta] [Fechar]
  → Fechar com ESC ou clique no backdrop
```

### 3.2 Fluxo: Cadastrar Novo Ativo
```
Clique em [+ Cadastrar Ativo]
  → Drawer lateral (600px) com formulário em etapas:
     Etapa 1: Identificação (Nome, Categoria, Localização, Tag opcional)
     Etapa 2: Valores (Valor de compra, Data de compra, Vida útil)
     Etapa 3: Responsável (Pessoa ou setor + anexar foto)
  → Botão "Salvar e Cadastrar Outro" + "Salvar e Fechar"
  → Validação inline em cada campo
  → Ao salvar: tabela atualiza + toast verde "Ativo PAT-0493 cadastrado com sucesso"
```

### 3.3 Fluxo: Iniciar Auditoria
```
Clique em [📋 Iniciar Auditoria]
  → Modal "Nova Auditoria":
     ├── Responsável: busca de auditor
     ├── Período: date range picker
     ├── Abrangência: Tudo / Por Local / Por Categoria / Selecionados
     └── [Agendar] [Iniciar Agora] [Cancelar]
  → Ao "Iniciar Agora": redireciona para tela de auditoria (checklist)
```

### 3.4 Fluxo: Transferir Responsável
```
Clique no ícone 🔄 (linha) ou [Transferir] (em massa)
  → Modal "Transferir Responsável":
     ├── Ativo: PAT-0492 - Notebook Dell (apenas leitura)
     ├── Novo Responsável: busca com autocomplete (pessoas + setores)
     ├── Data da Transferência: date picker (padrão: hoje)
     ├── Observação: textarea opcional
     └── [Transferir] [Cancelar]
  → Ao transferir: badge "Responsável alterado" pisca na linha + log no histórico
```

---

## 4. Design Visual (Design Tokens)

### Paleta

| Token | HEX | Uso |
|-------|-----|-----|
| Primary | `#2563EB` | Botão principal, links, hover states |
| Primary Dark | `#1D4ED8` | Active states |
| Secondary | `#EA580C` | Auditoria, alertas |
| Success | `#16A34A` | Status Ativo, variação positiva |
| Warning | `#CA8A04` | Status Manutenção |
| Danger | `#DC2626` | Status Baixado, Alertas |
| Surface | `#FFFFFF` | Fundo da tela |
| Surface Secondary | `#F9FAFB` | Fundo zebrado da tabela |
| Border | `#E5E7EB` | Bordas, dividers |
| Text Primary | `#111827` | Títulos, valores |
| Text Secondary | `#6B7280` | Labels, subtítulos |

### Tipografia

| Elemento | Font Stack | Peso | Tamanho |
|----------|-----------|------|---------|
| Valor do card | Inter | Bold | 28px |
| Label do card | Inter | Medium | 13px |
| Nome do item | Inter | Medium | 14px |
| Código/Tag | JetBrains Mono | Regular | 13px |
| Badge Status | Inter | Semibold | 12px |
| Ações (ícones) | — | — | 18px |

### Espaçamentos

- Grid padding: 24px
- Entre cards/sections: 20px
- Linhas da tabela: 52px de altura
- Padding interno células: 12px horizontal, 8px vertical

---

## 5. Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| >1440px | Layout completo conforme descrito |
| 1024–1440px | Cards 2x2 |
| 768–1024px | Tabela mantém, filtra colunas: "Cat/Local" colapsa em badge só "Local", "Valor" e "Código" ficam menores |
| <768px | Tabela converte para **card view** (cada linha vira um card) + busca e filtros ocupam largura total |

---

## 6. Microinterações & Animações

| Interação | Animação | Duração | Easing |
|-----------|----------|---------|--------|
| Card hover | Translate Y -2px + shadow intensify | 150ms | ease-out |
| Checkbox toggle | Scale 1→1.1→1 | 200ms | spring |
| Drawer lateral | Slide right 0→480px | 200ms | ease-out |
| Toast aparece | Slide down + fade in | 250ms | ease-out |
| Toast some | Fade out + slide up | 200ms | ease-in |
| Tabela filtra | Opacity transition + row reorder | 300ms | ease |
| Barra massa | Slide up 0→56px | 200ms | ease-out |
| Badge status | Background color transition | 150ms | ease |

---

## 7. Acessibilidade (a11y)

- Todos os ícones com `aria-label`
- Tabela com `role="grid"` e navegação por teclado (setas, Tab, Enter)
- Foco visível em todos os elementos interativos (outline 2px)
- Contraste mínimo 4.5:1 nos textos
- Suporte a `prefers-reduced-motion` (desliga animações)
- Mensagens de erro associadas via `aria-describedby`

---

## 8. Stack Técnica (Sugestão)

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18+ com Next.js (SSR na tela inicial) |
| Component Library | Radix UI (primitivos acessíveis) |
| Estilização | Tailwind CSS + design tokens CSS |
| Tabela | TanStack Table (virtualizada, ordenável, filtrável) |
| Gráficos (KPI detail) | Recharts / Nivo |
| Drawer/Modal | Headless UI + Framer Motion |
| PDF/Export | jspdf + xlsx |
| QR Code | qrcode.react |
| Testes | Jest + Testing Library + Cypress (E2E) |
| Animação | Framer Motion |

---

## 9. Métricas de Sucesso (UX)

| Métrica | Critério | Como medir |
|---------|----------|------------|
| Time-on-task: encontrar ativo | < 8 segundos | Log de analytics |
| Time-on-task: cadastrar ativo | < 2 minutos | Log de analytics |
| Erros de preenchimento | < 3% | Validação front-end |
| Cliques por tarefa (transferir) | ≤ 4 cliques | User flow tracking |
| Satisfação | SUS Score ≥ 82 | Pesquisa pós-implantação |

---

## 10. Próximos Passos (Sugestão de Implementação)

1. Protótipo navegável no Figma (validação com stakeholders)
2. Implementação do **componente de busca inteligente** (maior complexidade)
3. Implementação da **tabela com TanStack Table** (colunas, ordenação, filtro)
4. Drawers e modais
5. Fluxo de cadastro
6. Exportação e etiquetas
7. Auditoria
8. Testes E2E + a11y audit
