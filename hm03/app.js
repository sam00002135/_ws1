import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT,title TEXT, body TEXT)");

const router = new Router();

router.get('/', userList) // 根據不同用戶顯示貼文列表
  .get('/:user/', list) // 根據不同用戶顯示貼文列表
  .get('/:user/post/new', add) // 顯示新增貼文的表單
  .get('/:user/post/:id', show) // 顯示特定 id 的貼文
  .post('/:user/post', create); // 提交新貼文

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

function query(sql,args=[]) {
  let list = []
  for (const [id,user, title, body] of db.query(sql,args)) {
    list.push({id,user, title, body})
  }
  return list
}

async function userList(ctx) {
  let users = query(`SELECT DISTINCT user FROM posts`);
  ctx.response.body = await render.userList(users)
}

async function list(ctx) {
  const user = ctx.params.user;
  console.log('user=', user)
  let posts = query(`SELECT id, user, title, body FROM posts WHERE user = ?`, [user]);
  console.log('list:posts=', posts)
  ctx.response.body = await render.list(user, posts);
}

async function add(ctx) {
  const user =ctx. params.user;
  console.log('add:user=', user)
  ctx.response.body = await render.newPost(user);
}

async function show(ctx) {
  const user =ctx. params.user;
  const pid = ctx.params.id;
  let posts = query(`SELECT id,user, title, body FROM posts WHERE id=${pid}`)
  let post = posts[0]
  console.log('show:post=', post)
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(user,post);
}

async function create(ctx) {
  const user =ctx. params.user ||'joo';
  const body = ctx.request.body
  if (body.type() === "form") {
    const pairs = await body.form()
    const post = {}
    for (const [key, value] of pairs) {
      post[key] = value
    }
    let posts=query(`SELECT id,user, title, body FROM posts WHERE user=?`,[user])
    if (!posts[user]) {
      posts[user] = []; // 若用戶的貼文列表不存在，則初始化為空陣列
    }
    console.log('create:post=', post)
    db.query("INSERT INTO posts (user,title, body) VALUES (?,?,?)", [user,post.title, post.body]);
    ctx.response.redirect(`/${user}/`); 
  }
}

console.log('Server running at http://127.0.0.1:8009');
await app.listen({ port: 8009 });