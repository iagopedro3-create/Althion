/**
 * Chave usada quando nenhum endereço de cliente é resolvível.
 *
 * É deliberadamente nomeada em vez de `undefined`: um balde chamado
 * `unresolved-client` estourando é sinal legível de configuração errada, ao
 * passo que `undefined` viraria um balde compartilhado silencioso — exatamente
 * o defeito que este controle existe para evitar.
 */
export const UNRESOLVED_CLIENT = 'unresolved-client';

/**
 * Forma mínima da requisição de que a identificação depende.
 *
 * `ips` é populado pelo Express a partir de `X-Forwarded-For` **apenas** quando
 * `trust proxy` está configurado; sem isso vem vazio e `ip` é o endereço do
 * socket (o proxy, quando existe um à frente). Ver `configure-application.ts`.
 */
export interface ClientAddressCarrier {
  readonly ip?: string;
  readonly ips?: readonly string[];
}

/**
 * Identidade do cliente para fins de rate limit.
 *
 * Com `trust proxy` configurado, `ips[0]` é o endereço mais à esquerda do
 * `X-Forwarded-For` depois de descartados os saltos confiáveis — isto é, o
 * cliente real. Sem proxy confiável, `ip` já é o cliente real.
 */
export function resolveClientIdentity(request: ClientAddressCarrier): string {
  const forwarded = request.ips?.find((address) => address.trim().length > 0);
  if (forwarded) return forwarded.trim();

  const direct = request.ip?.trim();
  if (direct) return direct;

  return UNRESOLVED_CLIENT;
}
