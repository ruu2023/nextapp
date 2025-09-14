import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ブログ詳細記事取得用 api
export async function GET(req: Request) {
  try {
    const id: number = parseInt(req.url.split('/blog/')[1]);
    const post = await prisma.post.findFirst({where: {id}}); // http://localhost:3000/api/blog/1
    return NextResponse.json({ message: "success", post });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

// ブログ編集用 api
export async function PUT(req: Request) {
  try {
    const id: number = parseInt(req.url.split('/blog/')[1]);
    const { title, description } = await req.json();
    const post = await prisma.post.update({ 
      data: {
        title,
        description,
      },
      where: {
        id,
      },
    })
    return NextResponse.json({ message: "success", post });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
// ブログ削除用 api
export async function DELETE(req: Request) {
  try {
    const id: number = parseInt(req.url.split('/blog/')[1]);
    const post = await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: "success", post });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}
