# Althion Score v1 — Especificação proposta

## Estado da especificação

**Draft para decisão; não implementada e não publicada.**

Owner proposto: Produto Althion, com aprovação conjunta de Operações e revisão técnica. A fórmula deve possuir um responsável nominal antes de ser publicada.

## Propósito

O Althion Score sintetiza a eficiência operacional administrativa da jornada do paciente em uma escala de 0 a 100. Ele serve para localizar perdas, orientar investigação e acompanhar evolução. Não mede qualidade clínica, não prevê receita e não substitui a leitura dos componentes.

## Unidade de análise

- entidade: clínica, com unidade opcional;
- período padrão: 30 dias;
- períodos permitidos: 7 a 92 dias;
- fonte v1: entrada manual identificada;
- granularidade histórica: um snapshot por assessment enviado e versão da fórmula.

## Dimensões e pesos provisórios

| Código              | Dimensão              | Peso |
| ------------------- | --------------------- | ---: |
| `speed`             | Velocidade            |   15 |
| `conversion`        | Conversão             |   20 |
| `continuity`        | Continuidade          |   15 |
| `occupancy`         | Ocupação              |   15 |
| `attendance`        | Comparecimento        |   15 |
| `recovery`          | Recuperação           |   10 |
| `retention`         | Retenção              |    5 |
| `data_intelligence` | Inteligência de dados |    5 |

Os pesos somam 100. Eles são uma hipótese operacional e precisam ser calibrados com dados de pilotos; não são apresentados como benchmark de mercado.

## Modelo de cálculo

Cada métrica válida produz uma nota normalizada `m` entre 0 e 100 por transformação declarada na versão da fórmula. Cada transformação registra direção, parâmetros, unidade, arredondamento e reason codes.

Para uma dimensão `d`:

```text
dimension_score(d) = Σ(metric_score × metric_weight) / Σ(valid_metric_weight)
```

Para o Score global, somente quando a suficiência for atendida:

```text
althion_score = round(Σ(dimension_score × dimension_weight) / 100)
```

Regras:

- cálculo interno usa precisão decimal; exibição arredonda apenas no final;
- pesos de métricas inválidas não são redistribuídos entre dimensões;
- valores faltantes são `null`, nunca zero presumido;
- uma divisão por zero gera reason code e evidência de insuficiência;
- os valores exibidos incluem período, unidade, origem e versão da fórmula.

## Suficiência

Um Score global só existe quando:

- cobertura ponderada ≥ 75%;
- `speed`, `conversion`, `continuity`, `occupancy` e `attendance` possuem inputs válidos;
- não há inconsistência bloqueante;
- todos os parâmetros da fórmula estão publicados.

Se qualquer condição falhar:

```text
status = insufficient_data
score_value = null
```

A interface deve informar quais dados faltam, por que são necessários e quais componentes ainda puderam ser avaliados. Não será exibido `0/100` para representar ausência de dados.

## Evidência mínima

Cada componente calculado registra:

- assessment e período;
- fórmula e versão;
- código e unidade da métrica;
- valor observado;
- numerador e denominador, quando aplicável;
- fonte e qualidade declarada;
- transformação e parâmetros usados;
- resultado normalizado;
- timestamp e hash dos inputs.

## Qualidade e comparabilidade

Períodos serão comparados diretamente apenas quando possuírem duração e definições compatíveis. Mudança de fórmula deve ser destacada. O sistema não recalcula silenciosamente snapshots antigos com uma fórmula nova.

`data_intelligence` não substitui o guardrail de cobertura. A dimensão avalia práticas como origem identificada, denominadores disponíveis, consistência e atualidade; a cobertura determina se a nota global pode existir.

## Guardrails de comunicação

- usar “Score operacional administrativo”, nunca “nota clínica”;
- não afirmar causalidade ou retorno financeiro;
- não comparar clínicas ou especialidades sem coorte e metodologia aprovadas;
- não usar cores isoladamente para transmitir estado;
- sempre apresentar componentes e lacunas junto da nota;
- mostrar `v1-provisional` enquanto pesos e thresholds não forem validados em piloto.

## Estratégia de calibração

1. validar definições e denominadores com Produto e Operações;
2. aplicar a fórmula draft apenas a dados sintéticos;
3. executar cenários extremos, típicos e incompletos;
4. revisar com clínicas piloto sem expor rankings;
5. ajustar thresholds e pesos criando nova versão;
6. publicar a primeira versão somente com owner, changelog e critérios de suficiência aprovados.

Nenhum target externo será adotado sem fonte, contexto, data, especialidade e análise de comparabilidade.
