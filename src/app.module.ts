import { Logger, Module } from '@nestjs/common';
import { OwnerModule } from './owner/owner.module';

@Module({
  imports: [OwnerModule],
  providers: [Logger],
})
export class AppModule {}
