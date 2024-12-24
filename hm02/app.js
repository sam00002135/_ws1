import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js';

const posts = [
  { id : 0 , title : 'aaa' , body : 'aaaaa' , post_time : new Date(Date.now()).toLocaleString()},
  { id : 1 , title : 'bbb' , body : 'bbbbb' , post_time : new Date(Date.now()).toLocaleString()}
];

const router = new Router();

router.get ('/', list  )
      .get ('/post/new', add   )
      .get ('/post/:id', show  )
      .post('/post', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function list(ctx) {
  ctx.response.body = await render.list(posts);
}

async function add(ctx) {
  ctx.response.body = await render.newPost();
}

async function show(ctx) {
  const id = ctx.params.id;
  const post = posts[id];
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

async function create(ctx) {
  const body = ctx.request.body;
  if (body.type() === "form") {
    const pairs = await body.form();
    const post = {};
    for (const [key, value] of pairs) {
      post[key] = value;
    }
    console.log('post=', post);
    const id = posts.push(post) - 1;
    let td = new Date(Date.now()); 
    post.post_time = td.toLocaleString();
    post.id = id;
    ctx.response.redirect('/');
    console.log('post=', post);
  }
}

console.log('Server run at http://127.0.0.1:8012');
await app.listen({ port: 8012 });