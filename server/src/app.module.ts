import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SuperheroesModule } from './superheroes/superheroes.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SuperheroesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
