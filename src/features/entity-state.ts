export type AsyncStateStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface EntityState<TItem> {
  items: TItem[]
  current: TItem | null
  status: AsyncStateStatus
  error: string | null
}

export function createEntityState<TItem>(): EntityState<TItem> {
  return {
    items: [],
    current: null,
    status: 'idle',
    error: null,
  }
}

export function upsertEntity<TItem extends { id: string }>(items: TItem[], entity: TItem): TItem[] {
  const index = items.findIndex((item) => item.id === entity.id)

  if (index === -1) {
    return [entity, ...items]
  }

  return items.map((item) => (item.id === entity.id ? entity : item))
}
