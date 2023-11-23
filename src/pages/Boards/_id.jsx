import Container from '@mui/material/Container'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'
import { useState } from 'react'
import Login from '~/components/Login/Login'
import { mockData } from '~/apis/mock-data'

function Board() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey'))
  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{ height: '100vh' }}
    >
      {!apiKey ? (
        <Login setApiKey={setApiKey} />
      ) : (
        <>
          <AppBar />
          <BoardBar board={mockData.board} />
          <BoardContent board={mockData.board} />
        </>
      )}
    </Container>
  )
}

export default Board
