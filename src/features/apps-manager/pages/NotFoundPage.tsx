import Typography from '@mui/material/Typography'
import { AuthPageShell } from '@shared/ui/AuthPageShell'

export function NotFoundPage() {
  return (
    <AuthPageShell>
      <Typography component="h1" variant="h4" align="center">
        Page not found!
      </Typography>
    </AuthPageShell>
  )
}
