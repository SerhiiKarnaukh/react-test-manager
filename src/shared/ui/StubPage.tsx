import Typography from '@mui/material/Typography'
import { AuthPageShell } from '@shared/ui/AuthPageShell'

type StubPageProps = {
  title: string
}

export function StubPage({ title }: StubPageProps) {
  return (
    <AuthPageShell maxWidth={600}>
      <Typography component="h1" variant="h5" align="center">
        {title}
      </Typography>
    </AuthPageShell>
  )
}
