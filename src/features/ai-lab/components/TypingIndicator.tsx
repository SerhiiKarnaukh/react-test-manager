import Box from '@mui/material/Box'
import { keyframes } from '@mui/material/styles'

const typing = keyframes`
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1);
  }
`

export function TypingIndicator() {
  return (
    <Box
      role="status"
      aria-label="Loading response"
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 1.5, px: 2 }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            animation: `${typing} 1.4s infinite ease-in-out`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Box>
  )
}
