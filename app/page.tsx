"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CategoryChart } from "@/components/category-chart";

interface Transaction {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  type: "INCOME" | "EXPENSE";
}

const rowVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

export default function HomePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    amount: "",
    category: "",
    note: "",
    date: new Date().toISOString().slice(0, 10),
    type: "EXPENSE" as "INCOME" | "EXPENSE"
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/transactions");
        if (!response.ok) {
          throw new Error("加载失败");
        }
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setError("无法加载数据，请稍后再试。");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const totals = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      amount: form.amount,
      category: form.category.trim(),
      note: form.note.trim(),
      date: form.date,
      type: form.type
    };

    if (!payload.amount || !payload.category || !payload.date) {
      setError("请填写完整信息");
      return;
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      const created: Transaction = await response.json();
      setTransactions((prev) =>
        [...prev, created].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );
      setForm({ amount: "", category: "", note: "", date: form.date, type: form.type });
    } catch (err) {
      console.error(err);
      setError("保存失败，请稍后再试。");
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } catch (err) {
      console.error(err);
      setError("删除失败，请稍后重试。");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-16">
      <section className="grid gap-6 pt-4 sm:grid-cols-3">
        {[
          { label: "总收入", value: totals.totalIncome, accent: "text-emerald-500" },
          { label: "总支出", value: totals.totalExpense, accent: "text-rose-500" },
          { label: "余额", value: totals.balance, accent: totals.balance >= 0 ? "text-emerald-500" : "text-rose-500" }
        ].map((item) => (
          <motion.div
            key={item.label}
            className="rounded-2xl bg-card p-6 shadow-soft transition hover:-translate-y-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={`mt-3 text-2xl font-semibold ${item.accent}`}>
              ¥{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </motion.div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <motion.div
          layout
          className="rounded-2xl bg-card p-6 shadow-soft"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">收支记录</h2>
            <span className="text-sm text-muted-foreground">共 {transactions.length} 条</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-muted/30">
            <div className="max-h-[360px] overflow-y-auto">
              <table className="min-w-full divide-y divide-muted/30">
                <thead className="bg-muted/40 text-sm text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">日期</th>
                    <th className="px-4 py-3 text-left font-medium">类别</th>
                    <th className="px-4 py-3 text-left font-medium">备注</th>
                    <th className="px-4 py-3 text-right font-medium">金额</th>
                    <th className="px-4 py-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        正在加载...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                        还没有记录，添加第一笔吧！
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {transactions.map((transaction) => (
                        <motion.tr
                          key={transaction.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ duration: 0.2 }}
                          className="bg-background/60 transition hover:bg-primary/5"
                        >
                          <td className="px-4 py-3 text-sm">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{transaction.category}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {transaction.note || "-"}
                          </td>
                          <td
                            className={`px-4 py-3 text-right text-sm font-semibold ${
                              transaction.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "+" : "-"}
                            ¥{Math.abs(transaction.amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="rounded-full border border-rose-400/40 px-3 py-1 text-rose-500 transition hover:bg-rose-500/10"
                            >
                              删除
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">金额</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                className="w-full rounded-lg border border-muted/40 bg-background px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                placeholder="例如：120.50"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">类别</label>
              <input
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                className="w-full rounded-lg border border-muted/40 bg-background px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                placeholder="餐饮 / 工资 / 交通"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">备注</label>
              <input
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                className="w-full rounded-lg border border-muted/40 bg-background px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                placeholder="可选"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                className="w-full rounded-lg border border-muted/40 bg-background px-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">类型</label>
              <div className="flex gap-3">
                {[{ label: "支出", value: "EXPENSE" }, { label: "收入", value: "INCOME" }].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type: option.value as "INCOME" | "EXPENSE" }))}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      form.type === option.value
                        ? option.value === "INCOME"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                          : "border-rose-500 bg-rose-500/10 text-rose-500"
                        : "border-muted/40 text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-end">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:brightness-110"
              >
                添加记录
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CategoryChart
            expenses={transactions
              .filter((transaction) => transaction.type === "EXPENSE")
              .map((expense) => ({ category: expense.category, amount: expense.amount }))}
          />
        </motion.div>
      </section>
    </div>
  );
}
