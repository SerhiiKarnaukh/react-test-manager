import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

type SearchDialogProps = {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) return
    onClose()
    navigate(`/apps_manager/search?query=${encodeURIComponent(trimmed)}`)
    setQuery('')
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Search</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSearch} disabled={!query.trim()}>
          Search
        </Button>
      </DialogActions>
    </Dialog>
  )
}
