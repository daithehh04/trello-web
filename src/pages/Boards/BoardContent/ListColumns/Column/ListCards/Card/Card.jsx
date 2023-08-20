import CardMedia from '@mui/material/CardMedia'
import { Card as MuiCard } from '@mui/material'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import GroupIcon from '@mui/icons-material/Group'
import CommentIcon from '@mui/icons-material/Comment'
import AttachmentIcon from '@mui/icons-material/Attachment'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

function Card({ hideCardMedia }) {
  if (hideCardMedia) {
    return (
      <MuiCard
        sx={{
          cursor: 'pointer',
          boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
          overflow: 'unset'
        }}
      >
        <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
          <Typography>Card Test</Typography>
        </CardContent>
      </MuiCard>
    )
  }
  return (
    <MuiCard
      sx={{
        cursor: 'pointer',
        boxShadow: '0 1px 1px rgba(0,0,0,0.2)',
        overflow: 'unset'
      }}
    >
      <CardMedia
        sx={{ height: 140 }}
        image='https://images.unsplash.com/photo-1604323990536-e5452c0507c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8Zmxvd2VyJTIwYm91cXVldHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
        title='green iguana'
      />
      <CardContent sx={{ p: 1.5, '&:last-child': { p: 1.5 } }}>
        <Typography>Dai The Dev</Typography>
      </CardContent>
      <CardActions sx={{ p: '0 4px 8px 4px' }}>
        <Button
          size='small'
          startIcon={<GroupIcon />}
        >
          20
        </Button>
        <Button
          size='small'
          startIcon={<CommentIcon />}
        >
          15
        </Button>
        <Button
          size='small'
          startIcon={<AttachmentIcon />}
        >
          10
        </Button>
      </CardActions>
    </MuiCard>
  )
}

export default Card
