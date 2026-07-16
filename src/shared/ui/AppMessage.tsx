import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { useAlertStore } from '@core/alert/alert.store'

export function AppMessage() {
  const current = useAlertStore((s) => s.queue[0] ?? null)
  const dequeue = useAlertStore((s) => s.dequeue)

  return (
    <Snackbar
      open={Boolean(current)}
      autoHideDuration={5000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return
        dequeue()
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {current ? (
        <Alert
          severity={current.severity}
          variant="filled"
          onClose={dequeue}
          sx={{ width: '100%' }}
        >
          {current.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  )
}
