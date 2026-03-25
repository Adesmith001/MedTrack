import type { ReactNode } from 'react'

interface TableColumn {
  key: string
  label: string
}

interface TableRow {
  id: string
  cells: ReactNode[]
}

interface TableShellProps {
  columns: TableColumn[]
  rows: TableRow[]
  emptyMessage: string
}

export function TableShell({ columns, emptyMessage, rows }: TableShellProps) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50/90">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-sm text-slate-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50/60">
                  {row.cells.map((cell, index) => (
                    <td key={`${row.id}-${index}`} className="px-5 py-4 align-top text-sm leading-6 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
