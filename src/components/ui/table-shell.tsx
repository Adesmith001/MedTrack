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
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-sm text-slate-500" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  {row.cells.map((cell, index) => (
                    <td key={`${row.id}-${index}`} className="px-4 py-4 text-sm text-slate-700">
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
