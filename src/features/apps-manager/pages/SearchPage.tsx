import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useSearchParams } from 'react-router-dom'
import { AppCard } from '@features/apps-manager/components/AppCard'
import { useAppSearch } from '@features/apps-manager/hooks/useAppSearch'

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('query') ?? ''
  const { data: apps = [], isPending, isFetching } = useAppSearch(query)
  const loading = Boolean(query) && (isPending || isFetching)

  return (
    <Container maxWidth={false} sx={{ maxWidth: 1600, py: { xs: 4, md: 8 } }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        {query ? `Search term: "${query}"` : 'Search'}
      </Typography>

      {!query ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
          Enter a search term from the navbar.
        </Typography>
      ) : loading ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton
                variant="rectangular"
                sx={{ aspectRatio: '3 / 2', maxHeight: 210, width: '100%' }}
              />
              <Skeleton width="60%" sx={{ mt: 1.5 }} />
            </Grid>
          ))}
        </Grid>
      ) : apps.length > 0 ? (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {apps.map((application) => (
            <Grid key={application.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <AppCard application={application} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography align="center" sx={{ mt: 4 }}>
          Nothing was found.
        </Typography>
      )}
    </Container>
  )
}
