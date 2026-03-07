import { useEffect, useState } from 'react'
import { useNotesStore } from '@renderer/store/notesStore'
import { Card } from '@renderer/components/Card'
import { EmptyState } from '@renderer/components/EmptyState'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function Notes() {
  const { notes, selectedNoteId, fetchNotes, addNote, updateNote, deleteNote, selectNote } =
    useNotesStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle')
  const [_error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Notes component mounted')
    console.log('window.api:', window.api)
    console.log('window.api.notes:', window.api?.notes)
    fetchNotes()
  }, [fetchNotes])

  // Load selected note into editor
  useEffect(() => {
    if (selectedNoteId) {
      const note = notes.find((n) => n.id === selectedNoteId)
      if (note) {
        setTitle(note.title)
        setContent(note.content)
        setSaveStatus('saved')
      }
    } else {
      setTitle('')
      setContent('')
      setSaveStatus('idle')
    }
  }, [selectedNoteId, notes])

  // Auto-save with 2-second debounce
  useEffect(() => {
    if (!selectedNoteId) return

    const note = notes.find((n) => n.id === selectedNoteId)
    if (!note) return

    // Only save if there are changes
    if (note.title === title && note.content === content) {
      setSaveStatus('saved')
      return
    }

    setSaveStatus('saving')
    const timeoutId = setTimeout(async () => {
      try {
        await updateNote(selectedNoteId, { title, content })
        setSaveStatus('saved')
      } catch (err) {
        console.error('Failed to save note:', err)
        setSaveStatus('idle')
      }
    }, 2000)

    return () => clearTimeout(timeoutId)
  }, [title, content, selectedNoteId, notes, updateNote])

  const handleNewNote = async () => {
    console.log('handleNewNote called')
    try {
      setError(null)
      console.log('Calling addNote...')
      const result = await addNote({ title: 'Nueva Nota', content: '' })
      console.log('Note created successfully:', result)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear la nota'
      setError(errorMsg)
      console.error('Failed to create note:', err)
      alert('Error al crear nota: ' + errorMsg)
    }
  }

  const handleDelete = async () => {
    if (!selectedNoteId) return
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return

    try {
      await deleteNote(selectedNoteId)
    } catch (err) {
      console.error('Failed to delete note:', err)
    }
  }

  const selectedNote = notes.find((n) => n.id === selectedNoteId)

  return (
    <div style={{ display: 'flex', height: '100%', gap: 16 }}>
      {/* Left sidebar - Notes list */}
      <div
        style={{
          width: 280,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0
            }}
          >
            Notes
          </h1>
          <button
            onClick={handleNewNote}
            style={{
              padding: '8px 16px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            + Nueva
          </button>
        </header>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            overflowY: 'auto',
            flex: 1
          }}
        >
          {notes.length === 0 ? (
            <Card style={{ padding: 16 }}>
              <p style={{ color: 'var(--color-muted)', fontSize: 14, margin: 0 }}>
                No hay notas. Crea una nueva nota para empezar.
              </p>
            </Card>
          ) : (
            notes.map((note) => (
              <button
                key={note.id}
                onClick={() => selectNote(note.id)}
                style={{
                  padding: 12,
                  cursor: 'pointer',
                  background:
                    selectedNoteId === note.id
                      ? 'var(--color-primary-light)'
                      : 'var(--color-card-bg)',
                  border:
                    selectedNoteId === note.id
                      ? '1px solid var(--color-primary)'
                      : '1px solid var(--color-card-border)',
                  borderRadius: 12,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {note.title || 'Sin título'}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--color-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {new Date(note.updatedAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main editor area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!selectedNote ? (
          <EmptyState
            icon="📝"
            title="Selecciona una nota"
            description="Elige una nota de la lista o crea una nueva para empezar a escribir."
          />
        ) : (
          <>
            {/* Title input */}
            <Card style={{ padding: 16 }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título de la nota"
                style={{
                  width: '100%',
                  padding: '12px 0',
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  paddingTop: 8,
                  borderTop: '1px solid var(--color-card-border)'
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--color-muted)'
                  }}
                >
                  {saveStatus === 'saving' && 'Guardando...'}
                  {saveStatus === 'saved' && 'Guardado'}
                  {saveStatus === 'idle' && ' '}
                </span>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: '#E63946',
                    border: '1px solid #E63946',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </Card>

            {/* Split-pane editor/preview */}
            <Card style={{ padding: 0, flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50% 4px 50%',
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* Editor */}
                <div style={{ overflow: 'auto', padding: 16 }}>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu nota en markdown..."
                    style={{
                      width: '100%',
                      height: '100%',
                      padding: 0,
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--color-text)',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'ui-monospace, monospace'
                    }}
                  />
                </div>

                {/* Divider */}
                <div style={{ background: 'var(--color-card-border)' }} />

                {/* Preview */}
                <div
                  style={{
                    overflow: 'auto',
                    padding: 16
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: 'var(--color-text)'
                    }}
                    className="markdown-preview"
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || '*Vista previa vacía*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
