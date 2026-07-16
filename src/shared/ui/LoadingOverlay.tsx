import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export function LoadingOverlay() {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const open = fetching + mutating > 0

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        color: 'common.white',
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
}
