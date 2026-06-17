import { EmptyState } from '@renderer/components/EmptyState'

export function Projects(): React.JSX.Element {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>Proyectos</h1>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginTop: 4 }}>
          Organiza tu trabajo por proyecto
        </p>
      </header>
      <EmptyState
        icon="📁"
        title="Próximamente"
        description="Los proyectos estarán disponibles en una próxima actualización."
      />
    </div>
  )
}
