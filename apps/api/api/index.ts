/**
 * Entry serverless da Vercel para a API NestJS.
 *
 * SCAFFOLD — validar no primeiro deploy (ver docs/operations/deploy-staging.md).
 *
 * Por que importa de `../dist` e não de `../src`:
 * a injeção de dependência do Nest depende do metadata de decorator
 * (`emitDecoratorMetadata`) que o `tsc`/`nest build` emitem. O bundler da Vercel
 * (esbuild) NÃO emite esse metadata; compilar o Nest a partir do `src` aqui
 * quebraria a DI. Por isso rodamos `nest build` no build da Vercel e este entry
 * consome o JS já compilado. Este arquivo é ignorado pelo lint/typecheck do repo
 * (eslint.config.mjs) e compilado pela própria Vercel.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// Saída compilada por `pnpm --filter @althion/api build` (tsc). Sem .d.ts publicado.
// @ts-expect-error build artifact resolvido em runtime
import { AppModule } from '../dist/app.module.js';
// @ts-expect-error build artifact resolvido em runtime
import { ApiConfigService } from '../dist/config/api-config.service.js';
// @ts-expect-error build artifact resolvido em runtime
import { configureApplication } from '../dist/configure-application.js';

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => void;

let appPromise: Promise<INestApplication> | undefined;

async function getApp(): Promise<INestApplication> {
  if (!appPromise) {
    appPromise = (async () => {
      const app = await NestFactory.create(AppModule, { bufferLogs: true });
      const config = app.get(ApiConfigService);
      configureApplication(app, config);
      // Serverless: inicializa o app mas NÃO chama listen().
      await app.init();
      return app;
    })();
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const app = await getApp();
  const server = app.getHttpAdapter().getInstance() as NodeHandler;
  server(req, res);
}
