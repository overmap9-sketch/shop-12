import { Controller, Get, Param, Post, Body, Patch, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly svc: CategoriesService) {}

  @Get()
  list(@Query() query: any) { return this.svc.list(query); }

  @Get('tree')
  tree() { return this.svc.tree(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.svc.get(id); }

  @Post()
  create(@Body() body: any) { return this.svc.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}
