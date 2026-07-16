import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { AppItem } from '@features/apps-manager/api/reactApps'

type AppCardProps = {
  application: AppItem
}

export function AppCard({ application }: AppCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          flexShrink: 0,
          aspectRatio: '3 / 2',
          maxHeight: 210,
        }}
      >
        <CardMedia
          component="img"
          image={application.photo}
          alt={application.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </Box>
      <CardContent sx={{ py: 1.75, px: 2, '&:last-child': { pb: 1.25 } }}>
        <Typography
          component="h3"
          sx={{
            m: 0,
            fontSize: '1.0625rem',
            fontWeight: 600,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {application.title}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          px: 2,
          pb: 2,
          pt: 1.5,
          mt: 'auto',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Button
            href={application.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<ArticleOutlinedIcon />}
          >
            Description
          </Button>
          <Button
            href={application.view_url}
            variant="contained"
            size="small"
            startIcon={<OpenInNewIcon />}
          >
            View App
          </Button>
        </Box>
      </CardActions>
    </Card>
  )
}
