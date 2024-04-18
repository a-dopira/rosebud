import NavButton from "../../utils/NavButton"

const RoseMenu = () => {

    const menu_items = [
        {'url': 'notes', 'label': 'Заметки'},
        {'url': 'media', 'label': 'Медиа'},
        {'url': 'medication', 'label': 'Обработка от вредителей'},
        {'url': 'feedings', 'label': 'Подкормка'},
        {'url': 'foliage', 'label': 'Обрезки'},
    ]

    return (
        <div className="flex w-full h-20 rounded-3xl pattern-vertical-lines pattern-amber-500
            pattern-size-16 pattern-bg-umbra pattern-opacity-100 mx-auto items-center justify-between my-6">
                { menu_items.map((item, id) => {
                    return (
                        <NavButton to={item.url}>{item.label}</NavButton>
                    )
                })}
        </div>
    )
}

export default RoseMenu