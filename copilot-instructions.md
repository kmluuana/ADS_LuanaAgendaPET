# GitHub Copilot — Instruções do Repositório

## Fonte de verdade

Antes de propor ou executar alterações, leia `PROJECT_CONTEXT.md`.

O arquivo `PROJECT_CONTEXT.md` contém:

- escopo funcional;
- requisitos;
- regras de negócio;
- stack;
- arquitetura;
- restrições do projeto.

Não contradiga esse documento.

Se uma solicitação atual do usuário conflitar com ele, a solicitação explícita atual do usuário tem prioridade.

Não invente requisitos ausentes.

---

## Objetivo

Ajude a construir o TCC de agendamento de serviços para Pet Shop com código:

- simples;
- legível;
- didático;
- sustentável;
- proporcional ao problema.

Não transforme uma aplicação pequena em um projeto enterprise.

---

## Stack obrigatória

Preserve a stack existente:

Frontend:

- React;
- TypeScript;
- Vite;
- React Router;
- Tailwind CSS.

Backend:

- Node.js;
- TypeScript;
- Express.

Persistência:

- PostgreSQL;
- Prisma quando o acesso a dados estiver usando Prisma.

Integração:

- Z-API para WhatsApp.

Não substitua tecnologias sem pedido explícito.

---

## Arquitetura obrigatória

Backend monolítico e modular.

Fluxo padrão:

```text
Route -> Controller -> Service -> Repository -> PostgreSQL
```

Integrações externas devem ficar isoladas do domínio.

Jobs periódicos devem apenas disparar/orquestrar o processamento necessário.

Não criar microsserviços.

---

## Guardrail contra overengineering

Não introduzir espontaneamente:

- Clean Architecture purista;
- Hexagonal Architecture completa;
- Onion Architecture;
- DDD tático completo;
- CQRS;
- Event Sourcing;
- Kafka;
- RabbitMQ;
- Redis;
- GraphQL;
- WebSocket;
- Kubernetes;
- API Gateway;
- service mesh;
- event bus;
- dependency injection container externo;
- generic repositories;
- generic controllers;
- generic services;
- factories sem necessidade concreta;
- interfaces com uma única implementação sem motivo real.

Padrões são permitidos somente quando resolvem um problema concreto do projeto.

---

## Regra de alteração mínima

Ao receber uma tarefa:

1. identifique o menor conjunto de arquivos necessário;
2. altere apenas esse conjunto;
3. preserve comportamento não relacionado;
4. não faça refactor amplo sem solicitação;
5. não renomeie estruturas só por preferência;
6. não atualize dependências sem necessidade;
7. não reorganize pastas sem benefício claro.

Evite "aproveitei para melhorar".

---

## Antes de codificar

Inspecione o código existente.

Não suponha:

- nomes de arquivos;
- contratos da API;
- schema do Prisma;
- estrutura de pastas;
- variáveis de ambiente;
- tipos existentes;
- bibliotecas instaladas.

Reutilize padrões já adotados no projeto quando forem compatíveis com `PROJECT_CONTEXT.md`.

---

## Regras de negócio que não podem ser quebradas

### Agenda

A disponibilidade deve considerar intervalo completo.

Há conflito quando:

```text
inicioNovo < fimExistente
&&
fimNovo > inicioExistente
```

A duração do serviço define o horário final.

Remarcação deve validar conflito novamente.

Cancelamento libera o intervalo.

### Histórico

Não apagar fisicamente cliente, pet ou serviço quando isso destruir histórico.

Preferir inativação.

### WhatsApp

Falha da Z-API não pode desfazer nem impedir um agendamento já válido.

### Segurança

- nunca armazenar senha em texto puro;
- nunca retornar senha;
- nunca logar senha;
- segredos ficam em variáveis de ambiente;
- autorização deve respeitar o perfil autenticado.

---

## Backend

Controllers devem ser pequenos.

Controllers podem:

- receber a requisição;
- extrair dados;
- chamar service;
- devolver resposta HTTP.

Controllers não podem:

- acessar Prisma diretamente;
- implementar regra de agenda;
- chamar Z-API diretamente.

Services concentram regras de negócio.

Repositories concentram persistência.

Integrações concentram comunicação externa.

Não misturar essas responsabilidades apenas para economizar um arquivo.

Ao mesmo tempo, não criar uma camada nova se as camadas existentes já resolvem o problema.

---

## TypeScript

Não usar `any` como atalho.

Não usar casts inseguros para silenciar o compilador.

Não desabilitar regras de lint para esconder problema de modelagem.

Manter contratos claros.

Preferir funções pequenas e nomes explícitos.

Evitar comentários que apenas repetem o código.

Comentar regras não óbvias, especialmente:

- cálculo de sobreposição;
- decisões de segurança;
- comportamento da integração Z-API;
- trade-offs que possam causar dúvida futura.

---

## API

Não inventar campos.

Não inventar status.

Não alterar contratos existentes sem necessidade.

Usar status HTTP coerentes.

Não retornar sucesso para erro.

Não esconder falhas com:

- `null`;
- array vazio;
- `true`;
- `200 OK`;

quando a operação realmente falhou.

---

## Frontend

O frontend não é a fonte de verdade para regras de negócio.

Pode validar formulário para UX, mas o backend deve validar novamente.

Não adicionar biblioteca de estado global sem necessidade real.

Preferir hooks nativos e composição.

Não adicionar biblioteca visual concorrente com Tailwind sem pedido explícito.

A interface deve possuir estados claros de:

- carregamento;
- erro;
- vazio;
- sucesso;
- ação desabilitada quando aplicável.

---

## Dependências

Antes de adicionar uma dependência, verifique se:

1. o framework já resolve;
2. a linguagem já resolve;
3. existe código simples suficiente para resolver.

Não adicionar pacote para evitar poucas linhas de código simples.

Nunca trocar uma dependência principal sem solicitação explícita.

---

## Banco de dados

Preserve integridade referencial.

Não fazer migration destrutiva sem necessidade explícita.

Ao alterar o schema:

1. verificar impacto nos dados existentes;
2. verificar repositories;
3. verificar services;
4. verificar contratos da API;
5. verificar frontend afetado.

---

## Testes

Quando houver infraestrutura de testes no projeto, priorize testes para:

- conflito de agenda;
- cálculo de duração;
- alteração de status;
- inativação;
- autenticação;
- autorização;
- processamento de notificações;
- comportamento em falha da Z-API.

Testar comportamento e regra, não implementação trivial.

Não criar uma suíte gigantesca para código ainda inexistente.

---

## Proibições práticas

Não:

- gerar dezenas de arquivos para uma feature pequena;
- deixar TODO no lugar de requisito claro;
- deixar código morto;
- deixar imports sem uso;
- duplicar regra de negócio;
- colocar regra importante apenas no frontend;
- criar abstrações especulativas;
- misturar persistência com HTTP;
- misturar integração Z-API com controller;
- alterar arquivos gerados;
- editar `node_modules`;
- editar `dist`;
- versionar segredo;
- versionar `.env` real.

---

## Ao finalizar uma tarefa

Verifique, quando os comandos existirem no projeto:

- TypeScript;
- lint;
- testes;
- build.

Depois informe objetivamente:

- o que foi alterado;
- quais arquivos foram alterados;
- o que foi validado;
- o que não foi possível validar.

Não declarar que algo funciona sem ter verificado quando a verificação for possível.
