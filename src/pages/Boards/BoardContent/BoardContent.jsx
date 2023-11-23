import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  closestCenter
} from '@dnd-kit/core'
import { mapOrder } from '~/utils/sort'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatters'

const ACTIVE_DRAG_ITEM_STYLE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_STYLE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_STYLE_CARD'
}
function BoardContent({ board }) {
  const [orderedColumns, setOrderedColumns] = useState([])
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnDraggingCard, setOldColumnDraggingCard] = useState(null)
  const lastOverId = useRef(null)
  const pointerSensor = useSensor(PointerSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10
    }
  })
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10
    }
  })
  const touchSensor = useSensor(TouchSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      delay: 250,
      tolerance: 500
    }
  })
  // const sensors = useSensors(pointerSensor)
  const sensors = useSensors(mouseSensor, touchSensor)

  const findColumnByCardId = (cardId) => {
    return orderedColumns.find((column) => column.cards.map((card) => card._id)?.includes(cardId))
  }

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCarData
  ) => {
    setOrderedColumns((prevColumns) => {
      const overCardIndex = overColumn?.cards?.findIndex((card) => card._id === overCardId)
      let newCardIndex
      const isBelowOverItem =
        active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find((column) => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find((column) => column._id === overColumn._id)
      // old column
      if (nextActiveColumn) {
        //Delete card from column active to move new column
        nextActiveColumn.cards = nextActiveColumn.cards.filter((card) => card._id !== activeDraggingCardId)
        // Add placeholder card when empty
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }
        // update array cardOrderIds
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map((card) => card._id)
      }
      // new column
      if (nextOverColumn) {
        //check card exists in column
        nextOverColumn.cards = nextOverColumn.cards.filter((card) => card._id !== activeDraggingCardId)
        //add card to overColumn with new index
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, activeDraggingCarData)
        // delete placeholder card if exist
        nextOverColumn.cards = nextOverColumn.cards.filter((card) => !card.FE_PlaceholderCard)
        //update array cardOrderIds
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map((card) => card._id)
      }
      return nextColumns
    })
  }
  const handleDragStart = (event) => {
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(
      event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_STYLE.CARD : ACTIVE_DRAG_ITEM_STYLE.COLUMN
    )
    setActiveDragItemData(event?.active?.data?.current)
    if (event?.active?.data?.current?.columnId) {
      setOldColumnDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }
  const handleDragOver = (event) => {
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) return
    const { active, over } = event
    if (!active || !over) return
    const {
      id: activeDraggingCardId,
      data: { current: activeDraggingCarData }
    } = active
    const { id: overCardId } = over

    // Find 2 columns of id
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)
    if (!activeColumn || !overColumn) return
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCarData
      )
    }
  }
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event
    if (!active || !over) return
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.CARD) {
      const {
        id: activeDraggingCardId,
        data: { current: activeDraggingCarData }
      } = active
      const { id: overCardId } = over

      // Find 2 columns of id
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)
      // console.log('oldColumnDraggingCard', oldColumnDraggingCard)
      if (!activeColumn || !overColumn) return
      if (oldColumnDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCarData
        )
      } else {
        const oldCardIndex = oldColumnDraggingCard?.cards?.findIndex((c) => c._id === activeDragItemId)
        // new position of over card
        const newCardIndex = overColumn?.cards?.findIndex((c) => c._id === overCardId)
        const dndOrderedCards = arrayMove(oldColumnDraggingCard?.cards, oldCardIndex, newCardIndex)
        setOrderedColumns((prevColumns) => {
          const nextColumns = cloneDeep(prevColumns)
          const targetColumn = nextColumns.find((column) => column._id === overColumn._id)
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map((card) => card._id)
          return nextColumns
        })
      }
    }
    if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) {
      if (active.id !== over.id) {
        // old position of active card
        const oldColumnIndex = orderedColumns.findIndex((c) => c._id === active.id)
        // new position of over card
        const newColumnIndex = orderedColumns.findIndex((c) => c._id === over.id)
        // arrayMove to sort array init
        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)
        // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id)
        // console.log('dndOrderedColumnsIds',dndOrderedColumnsIds)
        setOrderedColumns(dndOrderedColumns)
      }
    }
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnDraggingCard(null)
  }

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  const DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5'
        }
      }
    })
  }

  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN) {
        return closestCorners({ ...args })
      }
      const pointerIntersections = pointerWithin(args)
      if (!pointerIntersections?.length) return
      // const interSections = pointerIntersections?.length > 0 ? pointerIntersections : rectIntersection(args)
      // Find the first overId in pointerIntersections
      let overId = getFirstCollision(pointerIntersections, 'id')
      if (overId) {
        const checkColumn = orderedColumns.find((column) => column._id === overId)
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) => {
              return container.id !== overId && checkColumn?.cardOrderIds?.includes(container.id)
            })
          })[0]?.id
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }
      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeDragItemType, orderedColumns]
  )
  return (
    <DndContext
      // collisionDetection={closestCorners}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Box
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2'),
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        <ListColumns columns={orderedColumns} />
        <DragOverlay dropAnimation={DropAnimation}>
          {!activeDragItemType && null}
          {activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.COLUMN && <Column column={activeDragItemData} />}
          {activeDragItemType === ACTIVE_DRAG_ITEM_STYLE.CARD && <Card card={activeDragItemData} />}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
