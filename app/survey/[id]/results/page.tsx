"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API = "http://localhost:8080/api/surveys";

export default function ResultsPage() {
  const { id } = useParams();

  const [results, setResults] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // const res = await fetch(`${API}/${id}`);
        const res = await fetch(`${API}/${id}/results`);
        const data = await res.json();

        setResults(data);

        const keys = new Set<string>();
        data.forEach((item: any) => {
          Object.keys(item).forEach((k) => keys.add(k));
        });

        setColumns(Array.from(keys));
      } catch (err) {
        console.error(err);
        alert("Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResults();
  }, [id]);

  // ================= EXPORT EXCEL =================
  const exportToExcel = () => {
    if (!results || results.length === 0) {
      alert("No data to export");
      return;
    }

    // 🔥 Normalize data
    const formatted = results.map((row) => {
      const newRow: any = {};

      columns.forEach((col) => {
        const value = row[col];

        if (Array.isArray(value)) {
          newRow[col] = value.join(", ");
        } else if (typeof value === "object" && value !== null) {
          newRow[col] = JSON.stringify(value);
        } else {
          newRow[col] = value ?? "";
        }
      });

      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

    // Auto column width
    const colWidths = columns.map((col) => ({
      wch: Math.max(
        col.length,
        ...formatted.map((row) => String(row[col] || "").length),
      ),
    }));

    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `survey-${id}-results.xlsx`);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (results.length === 0) return <p className="p-6">No responses yet</p>;

  const selectedField = columns[0];
  const chartData = buildChartData(results, selectedField);

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => router.replace("/")}
        >
          Survey Dashboard
        </h1>

        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Export Excel
        </button>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* PIE */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Pie Chart ({selectedField})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name">
                {chartData.map((_, index) => (
                  <Cell key={index} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Bar Chart ({selectedField})</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Responses Table</h2>

        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="border px-4 py-2 text-left">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {results.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="border px-4 py-2">
                      {formatValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= HELPERS =================
function buildChartData(data: any[], field: string) {
  const map: Record<string, number> = {};

  data.forEach((row) => {
    let value = row[field];

    if (Array.isArray(value)) {
      value.forEach((v) => {
        map[v] = (map[v] || 0) + 1;
      });
    } else {
      map[value] = (map[value] || 0) + 1;
    }
  });

  return Object.keys(map).map((key) => ({
    name: key,
    value: map[key],
  }));
}

function formatValue(value: any) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return value ?? "-";
}
