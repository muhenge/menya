import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Posts } from './entities/posts.entity';
import { CreatePostDto } from './dtos/createPost.dto';
import { GetAuthUser } from '../auth/decorators/';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
  ) {}

  async createPost(
    createPost: CreatePostDto,
    @GetAuthUser() user: User,
  ): Promise<{ data: Posts }> {
    const { title, content } = createPost;

    const post = this.postsRepository.create({
      title,
      content,
      author: user,
    });
    await this.postsRepository.save(post);
    return { data: post };
  }
}
