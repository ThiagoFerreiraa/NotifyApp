import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para o PWA acessar a API
  app.enableCors({
    origin: true, // Permite qualquer origem (ajuste em produção se necessário)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Servidor rodando na porta ${port}`);
}
bootstrap();
