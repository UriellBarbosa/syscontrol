# PRODUCT.md — SysControl

Documento vivo de arquitetura e decisões do projeto. Atualizado a cada decisão relevante.

---

## 1. Origem do projeto

O irmão de Uriel trabalha no setor de manutenção (categoria elétrica, com possibilidade de expansão para mecânica) de uma empresa e pediu uma planilha de controle de materiais e serviços (realizados e a realizar).

Uriel decidiu ir além de uma planilha simples e construir um sistema offline básico — tanto para atender ao irmão quanto para agregar ao próprio portfólio como freelancer.

**Natureza do projeto:** favor para o irmão + peça de portfólio pessoal. Sem cobrança envolvida.

---

## 2. Levantamento de requisitos (descoberta)

Perguntas feitas e respostas obtidas antes do início do desenvolvimento:

- **Usuários:** o irmão + 1 colega de trabalho (2 pessoas no total).
- **Ambiente:** local de trabalho tem internet, mas o sistema pode ser 100% offline.
- **Dispositivo:** prioridade para uso em computador (mobile fica em aberto para o futuro).
- **Autenticação:** sem login — acesso direto ao sistema.
- **Dados que precisam ser controlados nos materiais:** nome, quantidade, custo unitário (com cálculo de total).
- **Categorias de serviço:** elétrico (principal), com possibilidade de expandir para mecânico e outras no futuro.
- **Fluxo de prioridade dos serviços:** não existe hierarquia de aprovação — a demanda diária é gerenciada externamente via Asana pela empresa. O sistema é apenas para controle interno do setor de manutenção, sem necessidade de fluxo de aprovação.
- **Visibilidade:** uso interno do setor de manutenção. Relatórios podem ser usados para prestação de contas quinzenal/mensal ao gerente.

---

## 3. Decisões de escopo e arquitetura

### 3.1 Tipo de solução
Avaliadas duas abordagens antes de decidir:
- **Planilha automatizada** (Google Apps Script/VBA) — mais simples, mas frágil (risco de perda de configuração, dependência de terceiros, dificuldade de escalar).
- **Sistema próprio (offline, PWA/HTML local)** — escolhida. Mais robusto, dados armazenados localmente, mais valor para portfólio.

### 3.2 Stack definida
- **Frontend puro:** HTML + CSS + JavaScript (Vanilla), sem frameworks.
- **Persistência:** `LocalStorage` do navegador (dados salvos como JSON).
- **Sem backend, sem servidor, sem autenticação.**
- Motivo: simplicidade, zero custo de manutenção, alinhado ao caso de uso real (uso interno, 2 usuários, sem necessidade de sincronização entre dispositivos).

### 3.3 Riscos de perda de dados (avaliados e mitigados)
Cenários identificados:
- **Alta probabilidade:** limpeza de cache/histórico do navegador; uso em outro navegador (dados não sincronizam entre navegadores).
- **Média probabilidade:** formatação do computador sem backup; uso em modo anônimo.
- **Baixa probabilidade:** falha de hardware (HD/SSD).

**Mitigação decidida:** funcionalidade de **exportar/importar backup em JSON**, permitindo ao usuário salvar e restaurar os dados manualmente. Incluída no escopo do MVP.

### 3.4 Navegação
Optado por navegação em **abas** (não páginas separadas, não menu lateral) — mais simples e direto para um sistema pequeno com poucos módulos.

Abas definidas:
- **Início** — dashboard/visão geral (renomeada de "Relatórios" para refletir seu uso como tela inicial).
- **Materiais** — cadastro e listagem.
- **Serviços** — cadastro e listagem (ainda não implementada).

### 3.5 Relatórios / Exportação
Decisão inicial: exportar em CSV e PDF.
Decisão final (após discussão sobre uso real): **apenas PDF**, já que o relatório será usado para prestação de contas ao gerente (quinzenal/mensal), não para reimportação/manipulação de dados brutos. CSV foi removido do escopo para simplificar a interface.

**Conteúdo definido para o relatório PDF:**
- Cabeçalho (setor, período, data de geração)
- Resumo executivo (totais: serviços realizados/andamento/pendentes, total gasto em materiais)
- Listagem completa de serviços (status, categoria, data)
- Listagem completa de materiais (quantidade, custo)

**Observação técnica:** para gerar PDF localmente sem internet, será necessário baixar a biblioteca (ex: `jsPDF`) e referenciá-la localmente no projeto, em vez de via CDN — para manter o sistema 100% offline. **Ainda não implementado.**

---

## 4. Design / Mockup

Mockup validado com o usuário antes do início da codificação, com as seguintes iterações:
1. Versão inicial com 3 abas (Materiais, Serviços, Relatórios).
2. Aba "Relatórios" renomeada para "Início", convertida em dashboard com cards de resumo + tabela de últimos serviços + exportação.
3. Adicionados botões de ação (editar/excluir) em cada linha da tabela de Materiais, com modal de edição.
4. Botão de exportação simplificado — removido CSV, mantido apenas "Gerar relatório PDF".

Paleta e estilo visual:
- Fundo geral: `#f1f0ed`
- Superfícies (header, nav, cards): `#fafafa` / `#fff`
- Cor de destaque (accent): `#185fa5`
- Texto secundário: `#888`
- Texto principal: `#1a1a1a`
- Bordas: `#e0e0e0` / `#ddd`
- Border-radius padrão: `8px` (botões/inputs), `12px` (cards/tabelas)

---

## 5. Estrutura técnica implementada

### 5.1 Estrutura de arquivos
```
syscontrol/
├── css/
│   └── style.css
├── js/
│   └── index.js
├── index.html
├── README.md
└── PRODUCT.md
```

### 5.2 HTML — estrutura semântica
- `<header>` com título do sistema.
- `<nav>` com 3 botões de navegação (`data-secao="inicio|materiais|servicos"`).
- `<main>` com 3 `<section>` (uma por aba, controladas via JS).
- `<footer>` com copyright.

### 5.3 Navegação entre abas (JS)
Implementada via `querySelectorAll`, `forEach` e manipulação de `style.display` + classe `.active` nos botões. Função central: `mostrarSecao(id)`.

### 5.4 Módulo de Materiais — CRUD completo (implementado)

**Formulário de cadastro:**
- Campos: nome do material, categoria (select: eletrico/mecanico/outro), quantidade, custo unitário.
- Formulário escondido por padrão (`.hidden`), aberto via botão "Novo Material", fechável via botão "Cancelar".
- Validação: todos os campos obrigatórios (bloqueio via `alert` se algum estiver vazio).

**Persistência:**
- Dados armazenados na chave `'materiais'` do `LocalStorage`, como array de objetos JSON:
  ```js
  { nomeMaterial, categoria, quantidade, custoUnitario }
  ```

**Listagem (`carregarMateriais()`):**
- Busca e converte os dados do LocalStorage.
- Limpa e recria o `<tbody id="lista-materiais">` a cada chamada.
- Para cada material, renderiza uma linha com nome, categoria, quantidade, custo unitário, total calculado (`quantidade × custoUnitario`) e botões de ação.
- Chamada no carregamento da página e após qualquer alteração (criar/editar/excluir).

**Edição:**
- Cada linha carrega `data-indice` (posição no array) nos botões de ação.
- Variável de controle `let editandoIndice = null` guarda o índice em edição (ou `null` se for um novo cadastro).
- Botão "Editar" preenche o formulário com os dados existentes, abre o formulário e seta `editandoIndice`.
- Botão "Salvar" verifica `editandoIndice`: se preenchido, substitui o item na posição (`listaMateriais[editandoIndice] = material`); caso contrário, adiciona um novo (`listaMateriais.push(material)`). Ao final, sempre reseta `editandoIndice = null`.

**Exclusão:**
- Usa **delegação de eventos**: um único `addEventListener` no `<tbody id="lista-materiais">`, verificando via `e.target.classList.contains('btn-excluir')` se o clique foi em um botão de exclusão (necessário pois os botões são criados dinamicamente e não existem no carregamento inicial da página).
- Remove o item da lista com `listaMateriais.splice(indice, 1)` e salva a lista atualizada.

### 5.5 Módulo de Serviços
**Ainda não implementado.** Estrutura HTML da seção existe (`<section id="servicos">`) como placeholder. Terá lógica de CRUD similar à de Materiais, com campos: serviço, categoria, data, status (pendente/em andamento/concluído).

### 5.6 Dashboard (Início)
HTML/CSS implementados (cards de estatística + tabela de últimos serviços + botão de gerar PDF). **Lógica de JS para popular os cards e a tabela dinamicamente ainda não implementada** — depende da implementação do módulo de Serviços.

### 5.7 Backup (exportar/importar JSON)
Botões já existem no HTML (`#exp-backup`, `#imp-backup`). **Lógica de JS ainda não implementada.**

### 5.8 Geração de PDF
Botão já existe no HTML (`#gerar-pdf`). **Lógica de JS ainda não implementada** — depende da escolha e integração local da biblioteca `jsPDF` (ou similar).

---

## 6. Controle de versão

- Repositório público criado em: `https://github.com/UriellBarbosa/syscontrol`
- Primeiro commit: estrutura base (HTML, CSS, JS).
- Fluxo de trabalho padrão:
  ```
  git add .
  git commit -m "mensagem descritiva"
  git push
  ```

---

## 7. Contexto de aprendizado (relevante para o histórico do projeto)

Esse projeto está sendo desenvolvido **manualmente, linha por linha, pelo Uriel**, com a IA guiando por perguntas e correções — ao contrário do WMS e do EDGAR, onde a IA participa mais diretamente da escrita do código. O objetivo declarado é treinar a tradução de lógica para sintaxe e ganhar autonomia na escrita e debug de código.

Tópicos que geraram mais dúvidas durante o desenvolvimento (útil para retomar contexto futuro):
- Diferença entre seletores CSS (tag, class, id) e como isso se reflete no JavaScript (`getElementById`, `querySelector`, `querySelectorAll`).
- `flex` (`justify-content` vs `align-items`).
- Estrutura de comparação (`===`, `!==`, `>=`, `<=`, `&&`) — reforçada desde o projeto anterior do Apps Script (planilha de estoque).
- `forEach` e seu parâmetro de item (e depois, índice).
- Interpolação de string (template strings com crases e `${}`).
- `JSON.stringify` vs `JSON.parse`.
- `data-*` attributes e `.dataset` como forma de amarrar dados a elementos dinâmicos.
- Delegação de eventos (por que o listener precisa ir no elemento pai fixo, não nos elementos criados dinamicamente).
- Diferença entre `const` e `let`.
- Diferença entre callback e o parâmetro de evento (`e`) em `addEventListener`.

---

## 8. Roadmap / próximos passos

- [ ] Implementar módulo de Serviços (formulário + CRUD, seguindo o mesmo padrão de Materiais).
- [ ] Popular dinamicamente os cards de estatística e a tabela "Últimos serviços" da aba Início.
- [ ] Implementar exportação/importação de backup em JSON.
- [ ] Implementar geração de relatório em PDF (biblioteca local, sem CDN, para manter o sistema offline).
- [ ] Validação e testes gerais de UX com o irmão (usuário final).
- [ ] (Futuro, fora do escopo atual) Possível versão mobile/PWA.

---

## 9. Status atual

**Módulo de Materiais:** completo (criar, listar, editar, excluir, com persistência local).
**Módulo de Serviços:** não iniciado.
**Dashboard:** estrutura visual pronta, sem lógica dinâmica.
**Backup e PDF:** estrutura visual pronta (botões), sem lógica implementada.