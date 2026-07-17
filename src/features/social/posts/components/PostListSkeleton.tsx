import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

export function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" />
                <Skeleton width="25%" />
              </Box>
            </Box>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
