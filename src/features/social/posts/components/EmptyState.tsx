import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

type EmptyStateProps = {
  title: string
  message?: string
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {message ? (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}
