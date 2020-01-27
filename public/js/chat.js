const socket = io()

//Elements

$messageForm = document.querySelector('#messageForm')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')
$sendLocationButton = document.querySelector('#sendLocation')
$messages = document.querySelector('#messages')

// Templates

const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationTemplate = document.querySelector('#locationTemplate').innerHTML
const sidebarTemplate = document.querySelector('#sidebarTemplate').innerHTML


// Options

const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
// New message element
    const $newMessage = $messages.lastElementChild

// Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

// Visible height
    const visibleHeight = $messages.offsetHeight

// Height of messages container
    const containerHeight = $messages.scrollHeight

// How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('locationMessage', (message) => {
const html = Mustache.render(locationTemplate, {
    username:message.username,
    url:message.url,
    createdAt:moment(message.createdAt).format('h:mm a')
})
$messages.insertAdjacentHTML('beforeend', html)
autoscroll()
})


socket.on('message', (message) => {
const html = Mustache.render(messageTemplate, {
    username:message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')
})
$messages.insertAdjacentHTML('beforeend', html)
autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
//disable
$messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
//enable
$messageFormButton.removeAttribute('disabled')
$messageFormInput.value = ''
$messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your broweser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }

        socket.emit('sendLocation', location, (message) => {
            $sendLocationButton.removeAttribute('disabled')
            console.log(message)
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})