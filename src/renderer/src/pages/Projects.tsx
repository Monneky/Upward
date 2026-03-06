import { EmptyState } from '@renderer/components/EmptyState'

export function Projects() {
  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#F0EAD6',
            marginBottom: 4
          }}
        >
          Projects
        </h1>
        <p style={{ fontSize: 13, color: '#444' }}>
          Organize work by project
        </p>
      </header>
      <EmptyState
        icon="📁"
        title="Coming soon"
        description="Projects will be available in a future update."
      />
    </div>
  )
}
