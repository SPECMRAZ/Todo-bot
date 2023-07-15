import { AppService } from './app.service';
import { Telegraf } from 'telegraf';
import {
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { actionButtons } from './app.buttons';
import { Context } from './context.interface';
import { showList } from './app.utils';

const todos = [
  {
    id: 1,
    name: 'Buy goods',
    isCompleted: false,
  },
  {
    id: 2,
    name: 'Go to walk',
    isCompleted: false,
  },
  {
    id: 3,
    name: 'Travel',
    isCompleted: true,
  },
];

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Hi, Friend!');
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears('📄️Список задач')
  async listTask(ctx: Context) {
    await ctx.reply(showList(todos));
  }

  @Hears('⭕️Завершить')
  async doneTask(ctx: Context) {
    ctx.session.type = 'done';
    await ctx.reply('Напишите ID задачи: ');
  }

  @Hears('📝️Редактирование')
  async editTask(ctx: Context) {
    ctx.session.type = 'edit';
    await ctx.reply('Напишите ID задачи: ');
  }

  @Hears('❌️Удаление')
  async removeTask(ctx: Context) {
    ctx.session.type = 'remove';
    await ctx.reply('Напишите ID задачи: ');
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;

    if (ctx.session.type === 'done') {
      const todo = todos.find((t) => t.id === Number(message));
      if (!todo) {
        await ctx.deleteMessage();
        await ctx.reply('Задача не найдена!');
        return;
      }
      todo.isCompleted = !todo.isCompleted;
      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'edit') {
      const [taskId, taskName] = message.split('|');
      const todo = todos.find((t) => t.id === Number(taskId));

      if (!todo) {
        await ctx.deleteMessage();
        await ctx.reply('Задача не найдена!');
        return;
      }

      todo.name = taskName;
      await ctx.reply(showList(todos));
    }

    if (ctx.session.type === 'remove') {
      const todo = todos.find((t) => t.id === Number(message));

      if (!todo) {
        await ctx.deleteMessage();
        await ctx.reply('Задача не найдена!');
        return;
      }
    }
  }
}
