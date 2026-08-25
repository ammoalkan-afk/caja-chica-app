import Modal from './Modal'

export default function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-ink-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-900 hover:bg-sand-100"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-500/90"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
