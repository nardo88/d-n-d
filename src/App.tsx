import { PointerEvent, useRef, useState } from 'react'
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

    // Движение элемента
    const distance = dragBoundingRect.height + space

    itemsBelowDragItem.forEach((item) => {
      item.style.transform = `translateY(${distance}px)`
    })

    // Отпускаем кнопку мыши
    document.onpointerup = dragEnd

    function dragEnd() {
      document.onpointerup
      setIsDragging(null)
      // @ts-ignore
      dragItem.style = {}
      container.removeChild(div)
      items.forEach((item) => {
        // @ts-ignore
        item.style.transform = 'none'
      })
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
