import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ブログ取得用 api
export async function GET( ) {
  try {
    const posts = await prisma.post.findMany();
    return NextResponse.json({ message: "success", posts });
  } catch (err) {
    console.error(err);
    console.log("DB URL:", process.env.DATABASE_URL);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}

// ブログ投稿用 api
export async function POST(req: Request) {
  try {
    const {title, description} = await req.json();

    const post = await prisma.post.create({data: {title, description}});
    return NextResponse.json({ message: "success", post }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}