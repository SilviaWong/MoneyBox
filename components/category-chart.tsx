"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  BarElement,
  Title
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface CategoryChartProps {
  expenses: Array<{ category: string; amount: number }>;
}

export function CategoryChart({ expenses }: CategoryChartProps) {
  const data = useMemo(() => {
    const categoryMap = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});

    const labels = Object.keys(categoryMap);
    const values = labels.map((label) => categoryMap[label]);

    return {
      labels,
      datasets: [
        {
          label: "支出",
          data: values,
          backgroundColor: "rgba(239, 68, 68, 0.65)",
          borderRadius: 12,
          borderSkipped: false
        }
      ]
    };
  }, [expenses]);

  const options = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `¥${context.parsed.y?.toFixed(2) ?? 0}`
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) => `¥${value}`
        }
      }
    }
  }), []);

  if (!expenses.length) {
    return (
      <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
        暂无支出数据
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-soft">
      <h3 className="mb-4 text-lg font-semibold">按类别支出</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
