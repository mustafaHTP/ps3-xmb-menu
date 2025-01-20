import { log, LOG_TYPE } from './logger.js';
import * as Sfx from './sfx.js';

const DIRECTION = {
    Left: -1,
    Right: 1,
    Up: 1,
    Down: -1
}

let isTransitioningHorizontally = false;
let isTransitioningVertically = false;
let isStatusBarVisible = true;
const menuItemsMovementAmount = 200;
const subMenuItemsMovementAmount = 200;
const subMenuItemsMovementOffset = 200;
let activeMenuItemIndex = 0;
const menuItemsData = [];

function buildMenuItemsData() {
    //Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach((menuItem, index) => {
        //get child count
        //first get sub menu items container
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        const childCount = subMenuItemContainer.children.length;
        //get menu item index
        const menuItemIndex = index;
        //assign default active sub menu item index
        //ALL MENU ITEMS MUST HAVE AT LEAST ONE CHILD
        const activeSubMenuItemIndex = 0;
        //push data
        menuItemsData.push({ childCount, menuItemIndex, activeSubMenuItemIndex, subMenuItemContainer });
    });
}

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

async function moveMenuItemsHorizontally(direction) {

    // Check can move horizontally
    if (!(direction === DIRECTION.Right && activeMenuItemIndex < menuItemsData.length - 1 || direction === DIRECTION.Left && activeMenuItemIndex > 0)) {
        log(LOG_TYPE.WARNING, 'Can not move horizontally');

        return;
    }

    if(isTransitioningHorizontally){
        log(LOG_TYPE.WARNING, 'Transitioning');

        return;
    }

    isTransitioningHorizontally = true;

    // Change active menu item index
    changeActiveMenuItemIndex(direction);

    // Change style of active menu item
    updateStyleActiveMenuItem();

    await Sfx.playClick();

    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    console.log(menuItems);

    menuItems.forEach((menuItem) => {
        const currentTranslateX = getTranslateX(menuItem);
        menuItem.style.transform = `translateX(${currentTranslateX + (menuItemsMovementAmount * -direction)}px)`;
    });

    // Wait for transition to end
    menuItems.forEach((menuItem) => {
        menuItem.addEventListener('transitionend', () => {isTransitioningHorizontally = false});
    });
}

async function moveSubMenuItemsVertically(direction) {
    //Check can move vertically
    //First active sub menu item index
    const activeMenuItem = menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
    const subMenuItemsCount = activeMenuItem.childCount;
    const activeSubMenuItemIndex = activeMenuItem.activeSubMenuItemIndex;

    if (!(direction === DIRECTION.Down && activeSubMenuItemIndex < subMenuItemsCount - 1 || direction === DIRECTION.Up && activeSubMenuItemIndex > 0)) {
        console.log('Can not move vertically');

        return;
    }

    if(isTransitioningVertically){
        log(LOG_TYPE.WARNING, 'Transitioning');

        return;
    }

    isTransitioningVertically = true;

    changeActiveSubMenuItemIndex(direction);
    updateActiveSubMenuItemStyle();

    await Sfx.playClick();

    //Get selected menu item's children (sub menu items)
    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);
    subMenuItems.forEach((selectionItem, index) => {
        const currentTranslateY = getTranslateY(selectionItem);
        let applyOffsetIndex;
        if (direction === DIRECTION.Down) {
            applyOffsetIndex = activeSubMenuItemIndex;
        }
        else if (direction === DIRECTION.Up) {
            applyOffsetIndex = activeSubMenuItemIndex - 1;
        }
        const applyOffset = index === applyOffsetIndex;
        let transformAmount = applyOffset ?
            currentTranslateY + ((subMenuItemsMovementAmount + subMenuItemsMovementOffset) * direction)
            : currentTranslateY + (subMenuItemsMovementAmount * direction);
        selectionItem.style.transform = `translateY(${transformAmount}px)`;
    });

    subMenuItems.forEach((subMenuItem) => {
        subMenuItem.addEventListener('transitionend', () => {isTransitioningVertically = false});
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
    if (direction === 1 && activeMenuItemIndex < menuItemsData.length - 1) {
        activeMenuItemIndex++;
    } else if (direction === -1 && activeMenuItemIndex > 0) {
        activeMenuItemIndex--;
    }
}

function changeActiveSubMenuItemIndex(direction) {
    //Check can move vertically
    //First active sub menu item index
    const activeMenuItem = menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);

    if (direction === DIRECTION.Down) {
        activeMenuItem.activeSubMenuItemIndex++;
    } else if (direction === DIRECTION.Up) {
        activeMenuItem.activeSubMenuItemIndex--;
    }
}

function updateStatusBar() {
    //Update selected menu item index display
    const selectedMenuItemIndexDisplay = document.querySelector('#active-menu-item-index-display');
    selectedMenuItemIndexDisplay.innerHTML = activeMenuItemIndex;
}

function updateStyleActiveMenuItem() {
    const menuItems = document.querySelectorAll('.menu-item');

    //first remove active class from all menu items
    menuItems.forEach(menuItem => {
        menuItem.classList.remove('active-menu-item');
        menuItem.classList.remove('menu-item-active');
    })

    //add active class to the active menu item
    menuItems[activeMenuItemIndex].classList.add('active-menu-item');
    menuItems[activeMenuItemIndex].classList.add('menu-item-active');
}

function updateActiveSubMenuItemStyle() {
    const activeMenuItem = getActiveMenuItem();
    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);

    //first remove active class from all menu items
    subMenuItems.forEach(menuItem => {
        menuItem.classList.remove('active-sub-menu-item');
    })

    //add active class to the active menu item
    subMenuItems[activeMenuItem.activeSubMenuItemIndex].classList.add('active-sub-menu-item');
}

function toggleStatusBar() {
    isStatusBarVisible = !isStatusBarVisible;
    const statusBar = document.querySelector('.status-bar');
    statusBar.style.display = isStatusBarVisible ? 'block' : 'none';
}

function getActiveMenuItem() {
    return menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
}


buildMenuItemsData();
addBodyListener();

console.log(menuItemsData);