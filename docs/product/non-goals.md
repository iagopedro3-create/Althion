# Não objetivos

## Limites permanentes do domínio atual

A Althion atua na jornada administrativa. Não deverá oferecer:

- diagnóstico ou hipótese diagnóstica;
- prescrição ou recomendação de medicamento;
- prontuário eletrônico;
- telemedicina;
- interpretação de exames ou imagens;
- orientação médica;
- avaliação de urgência ou triagem clínica;
- decisão sobre tratamento;
- armazenamento estruturado de dados clínicos.

Conteúdo potencialmente clínico deve ser sinalizado para transferência humana conforme protocolo aprovado, sem interpretação pela IA.

## Capacidades que não serão reconstruídas

Enquanto a Helena cumprir o papel de motor operacional, a Althion não construirá:

- CRM genérico;
- inbox omnichannel;
- integração própria direta com WhatsApp;
- filas de atendimento;
- construtor de chatbot;
- sistema de campanhas;
- gerenciamento de agentes de IA;
- histórico operacional integral de atendimento.

A Althion manterá contratos próprios e adaptadores para evitar acoplamento ao fornecedor.

## Fora do escopo inicial

- aplicativo móvel;
- gestão financeira completa;
- marketplace;
- modelo próprio de linguagem;
- odontologia complexa: orçamento, aceite, tratamento, continuidade e manutenção;
- automação de alterações em Google Ads;
- automação irrestrita de Recovery ou Capacity;
- estimativa financeira apresentada como receita realizada;
- replicação integral do banco ou das mensagens da Helena;
- ingestão de anexos em OCR, RAG ou modelos de IA;
- armazenamento permanente de anexos espontâneos sem necessidade e base aprovadas.

## Não objetivos arquiteturais iniciais

- microserviços por módulo;
- event sourcing integral;
- GraphQL antes de existir necessidade demonstrada;
- data lake ou warehouse dedicado no início;
- Kubernetes;
- multi-region ativo-ativo;
- abstração para múltiplos bancos;
- otimização prematura para escala não observada.

O ponto de partida será um modular monolith com fronteiras explícitas e capacidade de extração futura.

## Critério para rever um não objetivo

Um item só deve entrar no escopo quando houver hipótese e benefício mensuráveis, riscos de segurança/LGPD avaliados, fonte de dados definida, critérios de aceite, impacto no roadmap e aprovação explícita.
