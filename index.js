const $grid = document.getElementById('grid')
const $startScreen = document.getElementById('start-screen')
const $startButton = $startScreen.getElementsByClassName('start-button')[0]
const gridCellsCollection = $grid.childNodes

document.addEventListener('keydown', applyDirectionChange)

var gameLoopIntervalRef = null

// enums
const DIRECTION_LEFT = 'left'
const DIRECTION_RIGHT = 'right'
const DIRECTION_UP = 'up'
const DIRECTION_DOWN = 'down'

// classes
const CLASSNAME_FOOD = 'foodCell'
const CLASSNAME_PLAYER = 'playerCell'
const CLASSNAME_GRID_CELL = 'box'
const CLASSNAME_HIDE_CONTENT = 'hide'

const gameOptions = {
    sizeX: 30,
    sizeY: 20,
    initalSpeed: 1000, // 1000 => one tick per second; the gameloop of snake evolves around 
    initalLength: 5,
    foodSpawnInterval: 2000// every x milliseconds
}


// will be populated with inherent information from the inital game options
const gameObject = {
    speed: 0,
    grid: [],
    freeGridCells: [], //TODO improve the 'get free cell' method to not loop itself
    player: [],
    foodLocations: [],
    timeTilNextFoodSpawn: 0,
    timeTilNextMovement: 0,
    currentDirection: DIRECTION_RIGHT,
    timeSinceLastUpdate: new Date(),
}



function startNewGame() {
    gameObject.speed = gameOptions.initalSpeed
    gameObject.length = gameOptions.initalLength
    gameObject.grid = generateGridMarkup()
    gameObject.player = generateInitalPlayer()
    gameObject.foodLocations = []
    gameObject.timeTilNextFoodSpawn = gameOptions.foodSpawnInterval
    gameObject.timeTilNextMovement = gameOptions.initalSpeed
    gameObject.timeSinceLastUpdate = new Date()
    gameLoopIntervalRef = setInterval(update, 1000 / 60)
    // Generate the first food item right at the start so the player has a goal to begin with
    generateFoodItem()
    $startScreen.classList.add(CLASSNAME_HIDE_CONTENT)
}


function generateInitalPlayer() {
    const ret = []
    // construct player tail to head
    for(let i = 0; i < gameOptions.initalLength; i++) {
        const posY = Math.floor(gameOptions.sizeY / 2)
        const posX = Math.floor(gameOptions.sizeX / 2) - gameOptions.initalLength + i
        ret.push([posX, posY])
    }
    return ret
}


function generateGridMarkup() {
    $grid.innerHTML = ''
    const ret = []

    const flexBasis = 100 / gameOptions.sizeX

    for(let x = 0; x < gameOptions.sizeX; x++) {
        for(let y = 0; y < gameOptions.sizeY; y++) {
            ret.push([x, y])

            const $box = document.createElement('DIV')
            $box.classList.add(CLASSNAME_GRID_CELL)
            $box.style.flexBasis = flexBasis + '%'
            $box.style.width = flexBasis + '%'
            $grid.appendChild($box)
        }
    }

    return ret
}


// return element selector for box start with 0,0
function getGridCell(x, y) {
    const rowStartPosition = y * gameOptions.sizeX
    const boxPosition = rowStartPosition + x
    return gridCellsCollection[boxPosition]
}



function gameOver() {
    window.clearInterval(gameLoopIntervalRef)
    console.log('how game over screen')
}


function getRandomFreeCellCoord () {
    const randomX = randomInt(0, gameOptions.sizeX)
    const randomY = randomInt(0, gameOptions.sizeY)

    // check if free => if more class
    // TODO maintain a list of empty positions to prevent loops
    // test the unlikely case of having all cells filled
    if (getGridCell(randomX, randomY).classList.length < 1) {
        return getRandomFreeCellCoord()
    } else {
        return [randomX, randomY]
    }
}


function applyDirectionChange(e) {
    switch (e.keyCode) {
        case 37:
            // left
            if (gameObject.currentDirection === DIRECTION_RIGHT) return
            gameObject.currentDirection = DIRECTION_LEFT;
            break
        case 38:
            // up
            if (gameObject.currentDirection === DIRECTION_DOWN) return
            gameObject.currentDirection = DIRECTION_UP;
            break
        case 39:
            // right
            if (gameObject.currentDirection === DIRECTION_LEFT) return
            gameObject.currentDirection = DIRECTION_RIGHT;
            break
        case 40:
            // down
            if (gameObject.currentDirection === DIRECTION_UP) return
            gameObject.currentDirection = DIRECTION_DOWN
            break
        default:
    }
}


function update() {
    const newUpdateTimeStamp = new Date()
    const deltaTime = getDeltaTime(newUpdateTimeStamp, gameObject.timeSinceLastUpdate)
    
    gameObject.timeTilNextMovement -= deltaTime
    if (gameObject.timeTilNextMovement <= 0) {
        const head = gameObject.player[gameObject.player.length - 1]
        let futureX = head[0]
        let futureY = head[1]

        if (gameObject.currentDirection === DIRECTION_RIGHT) {
            futureX++
        } else if (gameObject.currentDirection === DIRECTION_LEFT) {
            futureX--
        } else if (gameObject.currentDirection === DIRECTION_UP) {
            futureY--
        } else if (gameObject.currentDirection === DIRECTION_DOWN) {
            futureY++
        }

        if (!getGridCell(futureX, futureY).classList.contains(CLASSNAME_FOOD)) {
            gameObject.player.shift()
        } else {
            gameObject.foodLocations = gameObject.foodLocations.filter(m => !(m[0] === futureX && m[1] === futureY))
        }

        if (futureX > gameOptions.sizeX || futureX < 0 || futureY > gameOptions.sizeY || futureY < 0 ) {
            // trigger gameover && creal interval && return 
            gameOver()
            return
        }
        
        gameObject.player.push([futureX, futureY])
        gameObject.timeTilNextMovement = gameObject.speed
    }
    
    // food spawner
    gameObject.timeTilNextFoodSpawn -= deltaTime
    if (gameObject.timeTilNextFoodSpawn <= 0) {
        generateFoodItem()
    }

    gameObject.timeSinceLastUpdate = newUpdateTimeStamp
    console.log(gameObject.timeTilNextMovement)
    draw()
}


function draw() {
    //clear old state
    gameObject.grid.map(m => {
        const box = getGridCell(m[0], m[1])
        box.classList.remove(CLASSNAME_PLAYER)
        box.classList.remove(CLASSNAME_FOOD)
    })

    gameObject.player.map(m => {
        const playerElement = getGridCell(m[0], m[1])
        playerElement.classList.add(CLASSNAME_PLAYER)
    })

    gameObject.foodLocations.map(m => {
        const playerElement = getGridCell(m[0], m[1])
        playerElement.classList.add(CLASSNAME_FOOD)
    })
}


function generateFoodItem() {
    const foodCoord = getRandomFreeCellCoord()
    gameObject.foodLocations.push(foodCoord)
    gameObject.timeTilNextFoodSpawn = gameOptions.foodSpawnInterval
}

// ui events
$startButton.onclick = startNewGame

// utils
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getDeltaTime(startDate, endDate) {
    return (endDate.getTime() - startDate.getTime()) * -1
}
