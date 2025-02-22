import { PointerEvent, PointerEventHandler, useRef, useState } from 'react'
import './App.scss'
import { available } from './data'
import image from './assets/boy.svg'

function App() {
  const [data, setData] = useState(available)
  const [isDragging, setIsDragging] = useState<null | number>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function detectLeftButton(e: PointerEvent) {
    return e?.buttons === 1
  }

  function dragStart(e: PointerEvent, index: number) {
    if (!detectLeftButton(e)) {
      return
    }
    setIsDragging(index)
    const container = containerRef.current as HTMLDivElement
    const items = [...container.childNodes] as HTMLDivElement[]
    const dragItem = items[index] as HTMLDivElement
    const itemsBelowDragItem = [...items].splice(index + 1) as HTMLDivElement[]
    const notDragItems = [...items].filter((_, i) => i !== index)
    const dragData = [...data][index]
    let newData = [...data]

    // получение геометрии выбранного элемента
    const dragBoundingRect = dragItem.getBoundingClientRect()

    // получаем расстояние между карточками
    const space =
      items[1].getBoundingClientRect().top -
      items[0].getBoundingClientRect().bottom

    // стилизуем выбранный элемент
    dragItem.style.position = 'fixed'
    dragItem.style.zIndex = '5000'
    dragItem.style.width = dragBoundingRect.width + 'px'
    dragItem.style.height = dragBoundingRect.height + 'px'
    dragItem.style.top = dragBoundingRect.top + 'px'
    dragItem.style.left = dragBoundingRect.left + 'px'
    dragItem.style.cursor = 'grabbing'

    // добавляем заглушку на место перетаскиваемого элемента
    const div = document.createElement('div')
    div.id = 'temp-div'
    div.style.width = dragBoundingRect.width + 'px'
    div.style.height = dragBoundingRect.height + 'px'
    div.style.pointerEvents = 'none'
    container.appendChild(div)

    const distance = dragBoundingRect.height + space

    itemsBelowDragItem.forEach((item) => {
      item.style.transform = `translateY(${distance}px)`
    })
    // Движение элемента
    let x = e.clientX
    let y = e.clientY

    document.onpointermove = dragMove as any

    function dragMove(e: PointerEvent) {
      const posX = e.clientX - x
      const posY = e.clientY - y

      // меняем позицию выбранного элемента
      dragItem.style.transform = `translate(${posX}px, ${posY}px)`

      //
      notDragItems.forEach((item) => {
        const rect1 = dragItem.getBoundingClientRect()
        const rect2 = item.getBoundingClientRect()

        let isOverlapping =
          rect1.y < rect2.y + rect2.height / 2 &&
          rect1.y + rect1.height / 2 > rect2.y

        if (isOverlapping) {
          if (item.getAttribute('style')) {
            item.style.transform = ''
            index++
          } else {
            item.style.transform = `translateY(${distance}px)`
            index--
          }
          newData = newData.filter((item) => item.id !== dragData.id)
          newData.splice(index, 0, dragData)
        }
      })
    }

    // Отпускаем кнопку мыши
    document.onpointerup = dragEnd

    function dragEnd() {
      document.onpointerup = null
      document.onpointermove = null

      setIsDragging(null)
      // @ts-ignore
      dragItem.style = {}
      container.removeChild(div)
      items.forEach((item) => {
        // @ts-ignore
        item.style.transform = ''
      })
      setData(newData)
    }
  }

  return (
    <div className="container" ref={containerRef}>
      {data.map((item, index) => (
        <div key={item.id} onPointerDown={(e) => dragStart(e, index)}>
          <div className={`card ${isDragging === index ? 'dragging' : ''}`}>
            <div className="image-container">
              <img src={image} alt="" />
            </div>
            <div className="box">
              <h4>{item.title}</h4>
              <h2>{item.description}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
