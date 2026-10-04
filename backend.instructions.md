---
applyTo: "backend/**/*.ts,backend/**/*.tsx,backend/prisma/**/*"
---

# Backend — Regras específicas

Leia também `PROJECT_CONTEXT.md` e `.github/copilot-instructions.md`.

## Fluxo padrão

Preserve:

```text
Route -> Controller -> Service -> Repository -> Prisma -> PostgreSQL
```

Não pule direto de route/controller para Prisma quando existir regra de negócio.

Não crie camada adicional sem necessidade.

---

## Routes

Devem conter apenas:

- path;
- verbo HTTP;
- middlewares;
- controller.

Não colocar regra de negócio em arquivo de rota.

---

## Controllers

Controller traduz HTTP para chamada de aplicação.

Manter pequeno.

Não:

- executar query Prisma;
- calcular horários;
- validar sobreposição de agenda;
- montar regra de autorização complexa;
- chamar Z-API.

---

## Services

Services são responsáveis por regras do domínio.

Especialmente:

- disponibilidade;
- sobreposição;
- duração;
- status;
- vínculo profissional/serviço;
- inativação;
- decisões relacionadas ao agendamento.

Não transformar service em arquivo gigante.

Se um service crescer por responsabilidades diferentes, separar por funcionalidade real, não por padrão abstrato.

---

## Repositories

Repositories são responsáveis por persistência.

Não colocar decisão de negócio em query ou repository quando a regra precisa ser compreendida no service.

Queries podem ser específicas do caso de uso quando isso simplifica o sistema.

Evitar `BaseRepository<T>`.

---

## Prisma

Ao alterar `schema.prisma`:

- usar nomes consistentes com o domínio;
- manter relações explícitas;
- não usar cascade delete que possa destruir histórico sem decisão consciente;
- preferir campos `ativo`/status quando o requisito exige inativação;
- criar migration somente para alteração necessária.

Não editar migrations antigas já aplicadas para "arrumar".

Criar nova migration quando necessário.

---

## Agendamentos

Para detectar sobreposição:

```text
inicioNovo < fimExistente
&&
fimNovo > inicioExistente
```

Considere apenas agendamentos que realmente ocupam agenda.

Agendamento cancelado não deve bloquear horário.

A remarcação deve ignorar o próprio agendamento ao verificar conflito.

Não confiar em uma consulta que compare somente o horário inicial.

---

## Datas

Tratar datas de forma consistente.

Evitar misturar horário local e UTC sem uma decisão clara.

Não fazer conversões silenciosas difíceis de rastrear.

Centralizar convenção quando o projeto definir uma.

---

## Z-API

Isolar comunicação em `integrations` ou equivalente.

Não colocar token em código.

Falha de envio:

- registrar falha;
- atualizar status da notificação;
- não desfazer o agendamento.

Evitar retry infinito.

Não criar fila/mensageria sem requisito explícito.

---

## Jobs

O job de notificações deve:

1. localizar notificações pendentes cujo horário de envio chegou;
2. tentar enviar;
3. atualizar status;
4. registrar falha quando necessário.

Não mover toda a regra de notificação para o scheduler.

O scheduler apenas inicia o processamento.

---

## Segurança

Senha:

- armazenar apenas hash;
- nunca retornar;
- nunca logar.

Autorização:

- validar no backend;
- não confiar no perfil enviado pelo frontend.

Variáveis secretas:

- `.env` local;
- `.env.example` sem valores reais quando necessário.

---

## Erros HTTP

Usar respostas coerentes, por exemplo:

- 400 para entrada inválida;
- 401 para ausência/falha de autenticação;
- 403 para usuário autenticado sem permissão;
- 404 para recurso inexistente;
- 409 para conflito de estado/regra, como conflito de agenda quando adequado;
- 500 apenas para erro inesperado.

Não aplicar mecanicamente; respeitar o contrato já existente do projeto.
