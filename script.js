addBodyListener();

const DIRECTION = {
    Left: -1,
    Right: 1,
    Up: 1,
    Down: -1
}

let isStatusBarVisible = true;
const menuItemsMovementAmount = 200;
const subMenuItemsMovementAmount = 100;
const subMenuItemsCount = 3;
const menuItemCount = 3;
let activeMenuItemIndex = 0;
const menuItemSubMenuIndices = [
    {
        menuItemIndex: 0,
        activeSubMenuItemIndex: 0
    },
    {
        menuItemIndex: 1,
        activeSubMenuItemIndex: 0
    },
    {
        menuItemIndex: 2,
        activeSubMenuItemIndex: 0
    }
];

function addBodyListener() {
    document.body.addEventListener('keydown', (event) => {

        let direction;

        if (event.key === 'ArrowLeft') {
            direction = DIRECTION.Left;
            moveMenuItemsHorizontally(direction);
        }
        else if (event.key === 'ArrowRight') {
            direction = DIRECTION.Right;
            moveMenuItemsHorizontally(direction);

        } else if (event.key === 'ArrowUp') {
            direction = DIRECTION.Up;
            moveSubMenuItemsVertically(direction);
            
        } else if (event.key === 'ArrowDown') {
            direction = DIRECTION.Down;
            moveSubMenuItemsVertically(direction);
        }

        if (event.key === 't') {
            toggleStatusBar();
        }

        updateStatusBar();
    });
}

function moveMenuItemsHorizontally(direction) {

    // Check can move horizontally
    if (!(direction === DIRECTION.Right && activeMenuItemIndex < menuItemCount - 1 || direction === DIRECTION.Left && activeMenuItemIndex > 0)) {
        console.log('Can not move horizontally');

        return;
    }

    // Change active menu item index
    changeActiveMenuItemIndex(direction);

    // Change style of active menu item
    updateStyleActiveMenuItem();


    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    console.log(menuItems);

    menuItems.forEach((menuItem) => {
        const currentTranslateX = getTranslateX(menuItem);
        menuItem.style.transform = `translateX(${currentTranslateX + (menuItemsMovementAmount * -direction)}px)`;
    });
}

function moveSubMenuItemsVertically(direction) {
    //Check can move vertically
    //First active sub menu item index
    const activeSubMenuItemIndex = menuItemSubMenuIndices.find(item => item.menuItemIndex === activeMenuItemIndex).activeSubMenuItemIndex;

    console.log(`active sub menu items index: ${activeSubMenuItemIndex}`);

    if(!(direction === DIRECTION.Down && activeSubMenuItemIndex < subMenuItemsCount - 1 || direction === DIRECTION.Up && activeSubMenuItemIndex > 0)) {
        console.log('Can not move vertically');

        return;
    }

    changeActiveSubMenuItemIndex(direction);
    updateActiveSubMenuItemStyle();

    //Get selected menu item
    const menuItems = document.querySelectorAll('.menu-item');
    const selectedMenuItem = menuItems[activeMenuItemIndex];

    //Get selected menu item's children (selection items)
    const selectionItems = Array.from(selectedMenuItem.children);
    console.log(selectionItems);

    selectionItems.forEach((selectionItem) => {
        const currentTranslateY = getTranslateY(selectionItem);
        selectionItem.style.transform = `translateY(${currentTranslateY + (subMenuItemsMovementAmount * direction)}px)`;
    });
}

function getTranslateX(element) {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
}

function getTranslateY(element) {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m42;
}

function changeActiveMenuItemIndex(direction) {
    if (direction === 1 && activeMenuItemIndex < menuItemCount - 1) {
        activeMenuItemIndex++;
    } else if (direction === -1 && activeMenuItemIndex > 0) {
        activeMenuItemIndex--;
    }
}

function changeActiveSubMenuItemIndex(direction){
    //Check can move vertically
    //First active sub menu item index
    const activeMenuItemIndexItem = menuItemSubMenuIndices.find(item => item.menuItemIndex === activeMenuItemIndex);

    if (direction === DIRECTION.Down) {
        activeMenuItemIndexItem.activeSubMenuItemIndex++;
    }else if (direction === DIRECTION.Up) {
        activeMenuItemIndexItem.activeSubMenuItemIndex--;
    }
}

function updateStatusBar() {
    //Update selected menu item index display
    const selectedMenuItemIndexDisplay = document.querySelector('#active-menu-item-index-display');
    selectedMenuItemIndexDisplay.innerHTML = activeMenuItemIndex;

    //Update active selection item index display
    const activeSubMenuItemIndexDisplay = document.querySelector('#active-sub-menu-item-index-display');
    activeSubMenuItemIndexDisplay.innerHTML = 0;
}

function updateStyleActiveMenuItem() {
    const menuItems = document.querySelectorAll('.menu-item');

    //first remove active class from all menu items
    menuItems.forEach(menuItem => {
        menuItem.classList.remove('active-menu-item');
    })

    //add active class to the active menu item
    menuItems[activeMenuItemIndex].classList.add('active-menu-item');
}

function updateActiveSubMenuItemStyle(){
    const menuItems = document.querySelectorAll('.menu-item');
    const activeMenuItem = menuItems[activeMenuItemIndex];
    const subMenuItems = Array.from(activeMenuItem.children);

    //first remove active class from all menu items
    subMenuItems.forEach(menuItem => {
        menuItem.classList.remove('active-sub-menu-item');
    })

    const activeSubMenuItemIndex = menuItemSubMenuIndices.find(item => item.menuItemIndex === activeMenuItemIndex).activeSubMenuItemIndex;
    //add active class to the active menu item
    subMenuItems[activeSubMenuItemIndex].classList.add('active-sub-menu-item');
}

function toggleStatusBar() {
    isStatusBarVisible = !isStatusBarVisible;
    const statusBar = document.querySelector('.status-bar');
    statusBar.style.display = isStatusBarVisible ? 'block' : 'none';
}