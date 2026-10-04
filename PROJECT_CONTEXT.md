# PROJECT_CONTEXT.md

# Sistema de Agendamento de Serviços Pet

Este arquivo é a fonte de contexto funcional e arquitetural do projeto.

Antes de criar, alterar ou remover código, leia este documento e preserve as decisões descritas aqui.

Quando houver conflito entre uma sugestão técnica genérica e este documento, este documento tem prioridade.

---

## 1. Objetivo do projeto

O sistema tem como domínio a gestão de agendamentos de serviços para Pet Shops.

A solução deve permitir que clientes e funcionários:

- consultem horários disponíveis;
- realizem agendamentos;
- remarquem agendamentos;
- cancelem agendamentos;
- vinculem pets, serviços e profissionais aos agendamentos;
- recebam confirmações e lembretes via WhatsApp.

O sistema deve impedir conflitos de agenda e facilitar a rotina operacional do Pet Shop.

A aplicação é um TCC acadêmico, mas deve ser tratada como software real: simples, funcional, legível e sustentável.

---

## 2. Princípio arquitetural

A arquitetura escolhida é deliberadamente simples.

```text
Frontend React
      |
      | HTTP / JSON
      v
API REST Node.js + Express
      |
      v
Services / Regras de negócio
      |
      v
Repositories / Prisma
      |
      v
PostgreSQL

Backend
  |
  +----> Z-API / WhatsApp
  |
  +----> Job periódico de notificações
```

### Estilo arquitetural

Utilizar:

- arquitetura cliente-servidor;
- backend monolítico;
- organização modular por funcionalidade/responsabilidade;
- separação simples em camadas;
- API REST.

Fluxo padrão do backend:

```text
Route
  -> Controller
      -> Service
          -> Repository
              -> PostgreSQL
```

Não transformar o projeto em microsserviços.

Não aplicar arquitetura complexa apenas por "boa prática".

A complexidade da arquitetura deve ser proporcional à complexidade real do sistema.

---

## 3. Stack definida

### Frontend

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS

### Backend

- Node.js
- TypeScript
- Express

### Banco de dados

- PostgreSQL

### Acesso a dados

- Prisma é a opção definida para acesso ao PostgreSQL.

Se o projeto já estiver usando Prisma, continuar com Prisma.

Não substituir por Sequelize, TypeORM, Drizzle, Knex ou SQL manual sem uma decisão explícita.

### Integração externa

- Z-API para envio de mensagens via WhatsApp.

### Processo agendado

O backend deve possuir um processo periódico responsável por consultar notificações pendentes e realizar os envios programados.

---

## 4. Perfis do sistema

O sistema possui três perfis principais:

### Cliente

Pode operar sobre os dados e agendamentos permitidos ao próprio perfil.

### Atendente

Pode auxiliar clientes e operar os fluxos de atendimento e agendamento.

### Administrador

Pode administrar cadastros, serviços, profissionais e demais funcionalidades administrativas.

As permissões devem respeitar o perfil autenticado.

---

# 5. Requisitos Funcionais

## RF01 — Autenticação de Usuário

O sistema deve autenticar o usuário por:

- e-mail;
- senha.

Após a autenticação, o acesso deve ser liberado de acordo com o perfil do usuário.

### Regras relacionadas

- o e-mail deve ser único;
- a senha deve possuir no mínimo 8 caracteres;
- a senha deve possuir caracteres especiais;
- a senha nunca deve ser armazenada em texto puro;
- após 5 tentativas inválidas de login, o acesso deve ser temporariamente bloqueado;
- recuperação de senha deve utilizar um link com validade de 24 horas.

Não simplificar essas regras removendo validações previstas no requisito.

---

## RF02 — Gerenciar Perfil de Cliente

O sistema deve permitir:

- cadastrar tutor;
- consultar tutor;
- editar tutor;
- inativar tutor.

Dados mínimos previstos:

- nome;
- telefone/WhatsApp;
- endereço.

### Regra importante

Clientes com histórico de agendamentos não devem ser removidos fisicamente.

Devem ser inativados.

---

## RF03 — Gerenciar Pets

O sistema deve permitir cadastrar e manter pets vinculados a um tutor.

Dados previstos:

- nome;
- espécie;
- raça;
- porte;
- observações relevantes;
- alergias;
- informações comportamentais.

### Regras

- um tutor pode possuir vários pets;
- um pet pertence a um tutor;
- pets com histórico de agendamentos não devem ser removidos fisicamente;
- nesses casos, devem ser inativados.

---

## RF04 — Gerenciar Profissionais

O sistema deve permitir cadastrar e manter profissionais.

Cada profissional deve possuir informações suficientes para determinar:

- quais serviços pode executar;
- sua jornada de trabalho;
- sua disponibilidade.

A jornada do profissional participa do cálculo dos horários disponíveis.

---

## RF05 — Gerenciar Agendamento

O sistema deve disponibilizar uma agenda em formato de calendário.

Visualizações previstas:

- dia;
- semana;
- mês.

A agenda deve permitir filtro por:

- profissional;
- serviço.

Para criar um agendamento, devem ser considerados:

- tutor;
- pet;
- serviço;
- profissional;
- data;
- horário;
- duração do serviço.

### Regra central de conflito

Dois agendamentos do mesmo profissional não podem possuir intervalos de tempo sobrepostos.

Não basta comparar apenas o horário inicial.

Exemplo:

```text
Agendamento existente:
10:00 até 11:00

Novo agendamento:
10:30 até 11:00

Resultado:
CONFLITO
```

A validação deve considerar:

```text
inicioNovo < fimExistente
E
fimNovo > inicioExistente
```

Se as duas condições forem verdadeiras, há sobreposição.

### Duração

O horário final do agendamento deve ser calculado a partir da duração do serviço.

### Cancelamento

Ao cancelar um agendamento:

- o status deve ser atualizado;
- o intervalo anteriormente ocupado deve voltar a ficar disponível.

### Remarcação

A remarcação deve executar novamente todas as validações de disponibilidade.

### Status do agendamento

Os status previstos são:

- Agendado;
- Em Andamento;
- Concluído;
- Cancelado.

Evitar criar novos status sem necessidade funcional explícita.

---

## RF06 — Enviar Notificações via WhatsApp

A integração deve utilizar Z-API.

### Confirmação

Ao criar um agendamento com sucesso, o sistema deve programar/enviar uma confirmação contendo pelo menos:

- data;
- horário;
- pet;
- serviço.

### Lembrete

O sistema deve programar automaticamente um lembrete para:

```text
24 horas antes do atendimento
```

### Status da notificação

Cada tentativa de envio deve possuir um dos estados:

- Pendente;
- Enviado;
- Falhou.

### Regra crítica de resiliência

Falha na Z-API NÃO pode:

- cancelar o agendamento;
- desfazer o agendamento;
- impedir a persistência do agendamento.

O erro de comunicação deve ser registrado e tratado separadamente.

O agendamento é a operação principal.

A notificação é uma operação secundária.

---

## RF07 — Gerenciar Serviços

O sistema deve permitir:

- incluir serviço;
- consultar serviço;
- alterar serviço;
- inativar serviço.

Dados mínimos:

- nome;
- descrição;
- valor;
- duração estimada.

A duração do serviço é utilizada no cálculo da disponibilidade da agenda.

Serviços utilizados em histórico não devem ser apagados de forma que o histórico fique inconsistente.

Preferir inativação.

---

# 6. Requisitos Não Funcionais

## RNF01 — Responsividade

A interface deve funcionar adequadamente em diferentes tamanhos de tela.

Priorizar:

- desktop;
- tablet;
- smartphone.

Não criar uma experiência móvel separada se o layout responsivo resolver o problema.

---

## RNF02 — Proteção de Dados

O sistema deve proteger dados pessoais de usuários e pets.

Obrigatório:

- hash de senha;
- autorização por perfil;
- não expor senha em respostas da API;
- não registrar senha em logs;
- validar entrada;
- não colocar segredos no código-fonte;
- usar variáveis de ambiente para credenciais e tokens externos.

---

## RNF03 — Facilidade de Uso

A interface deve possuir:

- navegação simples;
- textos legíveis;
- ações claramente identificáveis;
- feedback visual para sucesso e erro;
- poucos passos para tarefas frequentes.

Operações prioritárias de UX:

- consultar horários;
- criar agendamento;
- remarcar;
- cancelar.

---

# 7. Casos de Uso

## UC01 — Gerenciar Autenticação e Perfil

Atores:

- cliente;
- atendente;
- administrador.

Objetivos:

- autenticar;
- recuperar senha;
- atualizar os próprios dados permitidos;
- acessar funcionalidades conforme o perfil.

---

## UC02 — Gerenciar Clientes e Pets

Atores:

- cliente/tutor;
- atendente;
- administrador.

Objetivos:

- manter tutores;
- manter pets;
- preservar vínculo tutor -> pet;
- preservar histórico de atendimentos.

---

## UC03 — Gerenciar Serviços e Profissionais

Ator principal:

- administrador.

Objetivos:

- cadastrar serviços;
- editar serviços;
- inativar serviços;
- cadastrar profissionais;
- vincular profissionais aos serviços que podem executar;
- definir jornada de trabalho.

---

## UC04 — Gerenciar Agendamentos

Atores:

- cliente;
- atendente.

Objetivos:

- visualizar agenda;
- criar agendamento;
- remarcar;
- cancelar.

A disponibilidade depende de:

```text
profissional
+ jornada
+ serviço
+ duração
+ agendamentos existentes
```

---

## UC05 — Enviar Notificações via WhatsApp

Sistema externo:

- Z-API.

Objetivos:

- enviar confirmação;
- enviar lembrete 24 horas antes;
- registrar histórico e status dos envios.

---

# 8. Modelo conceitual inicial

Este modelo representa o domínio e pode ser refinado durante a implementação sem quebrar as regras do projeto.

```text
Usuario
- id
- nome
- email
- senhaHash
- perfil
- ativo
- tentativasLogin
- bloqueadoAte

Cliente/Tutor
- id
- usuarioId
- telefone
- endereco
- ativo

Pet
- id
- tutorId
- nome
- especie
- raca
- porte
- observacoes
- ativo

Profissional
- id
- nome
- ativo

Servico
- id
- nome
- descricao
- valor
- duracaoMinutos
- ativo

ProfissionalServico
- profissionalId
- servicoId

JornadaProfissional
- id
- profissionalId
- diaSemana
- horarioInicio
- horarioFim

Agendamento
- id
- tutorId
- petId
- profissionalId
- servicoId
- inicio
- fim
- status

Notificacao
- id
- agendamentoId
- tipo
- dataProgramada
- dataEnvio
- status
- erro
```

Não transformar este modelo conceitual em dezenas de entidades sem necessidade.

---

# 9. Regras arquiteturais

## Backend

Cada camada possui responsabilidade clara.

### Route

Responsável por:

- URL;
- verbo HTTP;
- middleware da rota;
- delegação para controller.

Não deve conter regra de negócio.

### Controller

Responsável por:

- receber HTTP;
- extrair dados;
- chamar service;
- transformar resultado em resposta HTTP.

Controller deve ser pequeno.

Não deve:

- acessar Prisma diretamente;
- calcular disponibilidade;
- implementar regra de conflito;
- chamar Z-API diretamente.

### Service

Responsável por:

- regra de negócio;
- orquestração do caso de uso;
- validações que dependem do domínio.

Exemplos:

- validar conflito de agenda;
- calcular horário final;
- validar profissional x serviço;
- criar agendamento;
- cancelar agendamento.

### Repository

Responsável por:

- consulta;
- persistência;
- comunicação com Prisma/PostgreSQL.

Não deve decidir regra de negócio.

### Integration

Responsável pela comunicação com sistemas externos.

Exemplo:

```text
ZApiClient
```

A integração não deve conhecer regras da agenda.

### Job

Responsável por disparar o processamento periódico de notificações pendentes.

O job não deve concentrar regra de negócio.

---

# 10. Estrutura recomendada

A estrutura pode evoluir, mas deve continuar simples.

```text
agendamento-pet/
├── PROJECT_CONTEXT.md
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── integrations/
│   │   ├── jobs/
│   │   ├── middlewares/
│   │   └── config/
│   └── prisma/
│
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── routes/
        ├── services/
        └── types/
```

Não criar pastas vazias apenas para parecer arquitetado.

Criar uma pasta quando existir uma responsabilidade real para colocar nela.

---

# 11. Regras de implementação

## Regra 1 — Simplicidade primeiro

Preferir código direto e legível.

Não usar padrões sofisticados quando uma função simples resolve.

---

## Regra 2 — Não criar abstração sem necessidade

Evitar:

- BaseController;
- BaseService;
- BaseRepository;
- AbstractFactory;
- factories genéricas;
- wrappers sem benefício;
- interfaces com uma única implementação apenas por ritual;
- classes de uma linha que só delegam chamadas.

Criar abstração quando existir um problema concreto que ela resolva.

---

## Regra 3 — Não antecipar requisitos

Não implementar funcionalidades que não estão neste documento ou que não foram solicitadas.

Exemplos de coisas que não devem aparecer espontaneamente:

- microsserviços;
- Kafka;
- RabbitMQ;
- Redis;
- GraphQL;
- WebSocket;
- event sourcing;
- CQRS;
- Kubernetes;
- service mesh;
- API Gateway;
- filas;
- cache distribuído;
- Elasticsearch.

Uma tecnologia nova só entra quando existir requisito ou decisão explícita.

---

## Regra 4 — Regra de negócio fica no backend

O frontend pode validar dados para melhorar UX.

Mas validações importantes devem existir no backend.

Especialmente:

- conflito de horários;
- permissão por perfil;
- duração do serviço;
- profissional autorizado para o serviço;
- alteração de status;
- inativação;
- regras de autenticação.

Nunca confiar exclusivamente no frontend.

---

## Regra 5 — Banco não define sozinho o domínio

Constraints do PostgreSQL são úteis, mas regras de negócio devem permanecer compreensíveis no código.

---

## Regra 6 — Sem exclusão destrutiva de histórico

Quando uma entidade participa de histórico relevante:

- preferir inativação;
- preservar referências.

---

## Regra 7 — Falha de WhatsApp não derruba agendamento

Essa regra nunca deve ser invertida.

---

# 12. Convenções de código

## TypeScript

- evitar `any`;
- preferir tipos explícitos nos contratos;
- não usar cast inseguro para esconder erro;
- remover imports não utilizados;
- usar nomes de domínio compreensíveis;
- evitar funções gigantes;
- usar `async/await` de forma consistente.

## Nomenclatura

Código pode usar nomes técnicos em inglês quando fizer sentido para bibliotecas/frameworks.

Conceitos de domínio devem permanecer claros e consistentes.

Não misturar nomes diferentes para o mesmo conceito.

Exemplo ruim:

```text
customer
client
tutor
owner
```

escolhidos aleatoriamente para representar a mesma entidade.

Definir um termo e manter consistência.

---

# 13. Tratamento de erros

Erros devem ser classificados de forma compreensível.

Exemplos:

- entrada inválida;
- recurso não encontrado;
- conflito de agenda;
- usuário não autorizado;
- integração externa indisponível;
- erro interno inesperado.

Não retornar `200 OK` para uma operação que falhou.

Não engolir erros.

Não expor stack trace ou segredo em resposta HTTP.

---

# 14. Frontend

O frontend é responsável por:

- interface;
- navegação;
- formulários;
- feedback ao usuário;
- consumo da API;
- estado local necessário para a tela.

Não colocar no frontend a regra definitiva de disponibilidade da agenda.

A API é a fonte de verdade para disponibilidade e conflitos.

## React

Preferir:

- componentes pequenos;
- props simples;
- hooks nativos;
- composição.

Não adicionar Redux, Zustand ou outra biblioteca de estado global apenas por padrão.

Adicionar gerenciamento global somente quando existir necessidade concreta.

## React Router

Rotas devem representar telas reais do sistema.

Não criar uma árvore de rotas excessivamente complexa.

## Tailwind

Usar Tailwind para estilização.

Evitar adicionar outra biblioteca CSS concorrente sem necessidade.

---

# 15. API REST

Usar recursos e verbos HTTP de forma previsível.

Exemplos conceituais:

```text
GET    /servicos
POST   /servicos
PUT    /servicos/:id
PATCH  /servicos/:id/status

GET    /profissionais
POST   /profissionais

GET    /pets
POST   /pets

GET    /agendamentos
POST   /agendamentos
PATCH  /agendamentos/:id
PATCH  /agendamentos/:id/cancelamento
```

Os endpoints podem ser refinados durante a implementação.

Evitar criar endpoints orientados a ações quando um recurso REST simples resolver.

---

# 16. Prioridade de implementação

A implementação deve crescer por módulos funcionais completos.

Ordem inicial definida:

1. Serviços;
2. Profissionais;
3. Clientes/Tutores;
4. Pets;
5. Agendamentos;
6. Autenticação e autorização;
7. Notificações via WhatsApp;
8. Frontend e refinamentos da agenda conforme evolução do backend.

Uma feature deve, sempre que possível, atravessar o fluxo completo:

```text
rota
-> controller
-> service
-> repository
-> banco
```

antes de criar abstrações para features futuras.

---

# 17. Critério de decisão técnica

Antes de adicionar uma classe, biblioteca, camada ou padrão, responder:

1. Qual problema real isso resolve agora?
2. O requisito exige?
3. A solução atual realmente não resolve?
4. O ganho de clareza é maior que o custo de complexidade?

Se não houver resposta objetiva, não adicionar.

---

# 18. Regra de ouro

O objetivo não é provar que conhecemos arquitetura.

O objetivo é entregar corretamente o sistema de agendamento descrito neste documento.

Código simples, explícito e correto é melhor do que código sofisticado sem necessidade.
