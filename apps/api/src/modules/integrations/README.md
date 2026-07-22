# Integrações CRM

O módulo expõe modelos canônicos de `@althion/domain`. Cada instância de provider representa uma conexão de uma organização; tenant e credenciais não fazem parte dos DTOs de produto.

- `MockCrmProvider`: dados sintéticos, determinísticos e sem conteúdo clínico.
- `HelenaCrmProvider`: integração de dados **opcional** e desligada por padrão. A Helena opera em paralelo como motor operacional; este adapter não contém endpoint, autenticação ou payload inventado.
- `FutureCrmProvider`: ponto de extensão que declara capabilities não suportadas.

## Requisitos para ativar a integração de dados com a Helena

A Helena funciona em paralelo independentemente deste adapter. Antes de ligar a integração de dados (opcional, não bloqueia o roadmap), anexar/referenciar documentação oficial que cubra autenticação, ambientes, paginação, filtros incrementais, recursos, webhooks, assinatura, rate limits, erros, retenção e versionamento. Exigir sandbox não produtivo e testes de contrato.

Não registrar tokens, payloads brutos, corpo de mensagens ou anexos.
