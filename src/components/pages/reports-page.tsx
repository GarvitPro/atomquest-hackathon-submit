"use client";

import { useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/lib/demo-store";
import { sheetStatusLabels, uomLabels } from "@/lib/format";
import { calculateGoalProgress } from "@/lib/scoring";

type ReportRow = {
  employee: string;
  department: string;
  manager: string;
  sheetStatus: string;
  goalTitle: string;
  thrustArea: string;
  uom: string;
  target: number;
  actual: number;
  weightage: number;
  progress: number;
};

const columns: ColumnDef<ReportRow>[] = [
  { accessorKey: "employee", header: "Employee" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "manager", header: "Manager" },
  { accessorKey: "sheetStatus", header: "Sheet" },
  { accessorKey: "goalTitle", header: "Goal" },
  { accessorKey: "thrustArea", header: "Thrust area" },
  { accessorKey: "uom", header: "UoM" },
  { accessorKey: "target", header: "Target" },
  { accessorKey: "actual", header: "Actual" },
  { accessorKey: "weightage", header: "Weightage" },
  { accessorKey: "progress", header: "Progress" },
];

export function ReportsPage() {
  const { state } = useDemoStore();
  const [globalFilter, setGlobalFilter] = useState("");
  const rows = useMemo<ReportRow[]>(() => {
    return state.goalSheets.flatMap((sheet) => {
      const employee = state.users.find((user) => user.id === sheet.employeeId);
      const manager = state.users.find((user) => user.id === employee?.managerId);

      return sheet.goals.map((goal) => ({
        employee: employee?.name ?? sheet.employeeId,
        department: employee?.department ?? "Unknown",
        manager: manager?.name ?? "Unassigned",
        sheetStatus: sheetStatusLabels[sheet.status],
        goalTitle: goal.title,
        thrustArea: goal.thrustArea,
        uom: uomLabels[goal.uomType],
        target: goal.target,
        actual: goal.actual,
        weightage: goal.weightage,
        progress: calculateGoalProgress(goal),
      }));
    });
  }, [state.goalSheets, state.users]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const visibleRows = table.getRowModel().rows.map((row) => row.original);

  const downloadCsv = () => {
    const header = columns.map((column) => String(column.header)).join(",");
    const body = visibleRows
      .map((row) =>
        [
          row.employee,
          row.department,
          row.manager,
          row.sheetStatus,
          row.goalTitle,
          row.thrustArea,
          row.uom,
          row.target,
          row.actual,
          row.weightage,
          row.progress,
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8",
    });
    triggerDownload(blob, "atomquest-achievement-report.csv");
  };

  const downloadXlsx = async () => {
    const { Workbook } = await import("exceljs");
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Achievement Report");
    worksheet.columns = [
      { header: "Employee", key: "employee", width: 22 },
      { header: "Department", key: "department", width: 24 },
      { header: "Manager", key: "manager", width: 20 },
      { header: "Sheet", key: "sheetStatus", width: 14 },
      { header: "Goal", key: "goalTitle", width: 36 },
      { header: "Thrust Area", key: "thrustArea", width: 24 },
      { header: "UoM", key: "uom", width: 12 },
      { header: "Target", key: "target", width: 12 },
      { header: "Actual", key: "actual", width: 12 },
      { header: "Weightage", key: "weightage", width: 14 },
      { header: "Progress", key: "progress", width: 12 },
    ];
    worksheet.addRows(visibleRows);
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF14532D" },
    };
    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    const buffer = await workbook.xlsx.writeBuffer();
    triggerDownload(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "atomquest-achievement-report.xlsx",
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Achievement report</p>
          <h2 className="text-3xl font-semibold tracking-normal">Reports</h2>
          <p className="mt-1 max-w-3xl text-muted-foreground">
            Planned target versus actual achievement across every seeded goal.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={downloadCsv}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={downloadXlsx}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Report table</CardTitle>
            <Input
              className="max-w-sm"
              placeholder="Filter report"
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="bg-secondary text-left">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="cursor-pointer px-3 py-2"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t bg-card">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {visibleRows.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-8 text-center text-muted-foreground"
                      colSpan={columns.length}
                    >
                      No report rows match the current filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
