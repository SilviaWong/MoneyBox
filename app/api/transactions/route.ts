import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" }
  });

  return NextResponse.json(
    transactions.map((transaction) => ({
      ...transaction,
      date: transaction.date.toISOString()
    }))
  );
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const amount = Math.abs(parseFloat(data.amount));
    const date = new Date(data.date);
    const type = data.type === "INCOME" ? "INCOME" : "EXPENSE";
    const category = typeof data.category === "string" ? data.category.trim() : "";
    const note = typeof data.note === "string" && data.note.trim() !== "" ? data.note.trim() : null;

    if (Number.isNaN(amount) || !category || Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        category,
        note,
        date,
        type
      }
    });

    return NextResponse.json({
      ...transaction,
      date: transaction.date.toISOString()
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
