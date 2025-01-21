import { log, LOG_TYPE } from './logger.js';
import * as Sfx from './sfx.js';

const DIRECTION = {
    Left: -1,
    Right: 1,
    Up: 1,
    Down: -1
}

const HORIZONTAL_MOVEMENT_AMOUNT = 200;
const VERTICAL_MOVEMENT_AMOUNT = 120;
const VERTICAL_MOVEMENT_OFFSET = 250;
const NO_SUB_MENU_ITEM_COUNT = -1

let isTransitioningHorizontally = false;
let isTransitioningVertically = false;
let isStatusBarVisible = false;
let activeMenuItemIndex = 0;
const menuItemsData = [];

function buildMenuItemsData() {
    //Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach((menuItem, index) => {
        //get child count
        //first get sub menu items container
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        let subMenuItemCount = subMenuItemContainer ?
            subMenuItemContainer.children.length
            : NO_SUB_MENU_ITEM_COUNT;

        //get menu item index
        const menuItemIndex = index;
        //assign default active sub menu item index
        //ALL MENU ITEMS MUST HAVE AT LEAST ONE CHILD
        const activeSubMenuItemIndex = 0;
        //push data
        menuItemsData.push(
            {
                subMenuItemCount,
                menuItemIndex,
                activeSubMenuItemIndex,
                subMenuItemContainer,
            });
    });
}

function addBodyListener() {
    document.body.addEventListener('keydown', async (event) => {

        let direction;

        if (event.key === 'ArrowLeft') {
            direction = DIRECTION.Left;
            await moveMenuItemsHorizontally(direction);
        }
        else if (event.key === 'ArrowRight') {
            direction = DIRECTION.Right;
            await moveMenuItemsHorizontally(direction);

        } else if (event.key === 'ArrowUp') {
            direction = DIRECTION.Up;
            await moveSubMenuItemsVertically(direction);

        } else if (event.key === 'ArrowDown') {
            direction = DIRECTION.Down;
            await moveSubMenuItemsVertically(direction);
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

    if (isTransitioningHorizontally) {
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
        menuItem.style.transform = `translateX(${currentTranslateX + (HORIZONTAL_MOVEMENT_AMOUNT * -direction)}px)`;
    });

    await waitForAllTransitions(menuItems);
    isTransitioningHorizontally = false;
}

async function moveSubMenuItemsVertically(direction) {
    //Check can move vertically
    //First active sub menu item index
    const activeMenuItem = menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
    const subMenuItemsCount = activeMenuItem.subMenuItemCount;
    const activeSubMenuItemIndex = activeMenuItem.activeSubMenuItemIndex;

    //Check if menu item has sub menu items
    if (!activeMenuItem.subMenuItemCount === NO_SUB_MENU_ITEM_COUNT) {
        log(LOG_TYPE.WARNING, 'No sub menu items');

        return;
    }

    if (!(direction === DIRECTION.Down && activeSubMenuItemIndex < subMenuItemsCount - 1 || direction === DIRECTION.Up && activeSubMenuItemIndex > 0)) {
        console.log('Can not move vertically');

        return;
    }

    if (isTransitioningVertically) {
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
            currentTranslateY + ((VERTICAL_MOVEMENT_AMOUNT + VERTICAL_MOVEMENT_OFFSET) * direction)
            : currentTranslateY + (VERTICAL_MOVEMENT_AMOUNT * direction);
        selectionItem.style.transform = `translateY(${transformAmount}px)`;
    });

    // Wait for the transition to complete
    await waitForAllTransitions(subMenuItems);

    isTransitioningVertically = false;
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
    //Update active menu item index display
    const activeMenuItemIndexDisplay = document.querySelector('#active-menu-item-index-display');
    activeMenuItemIndexDisplay.innerHTML = activeMenuItemIndex;

    //Update active sub menu item index display
    const activeSubMenuItemIndexDisplayElement = document.querySelector('#active-sub-menu-item-index-display');
    const activeMenuItem = getActiveMenuItem();
    activeSubMenuItemIndexDisplayElement.innerHTML = activeMenuItem.activeSubMenuItemIndex;
}

function updateStyleActiveMenuItem() {
    const menuItems = document.querySelectorAll('.menu-item');

    //first remove active class from all menu items
    menuItems.forEach(menuItem => {
        const menuIconElement = menuItem.querySelector('.menu-item-icon');
        menuIconElement.classList.remove('active-menu-item-icon');

        const menuItemHeader = menuItem.querySelector('.menu-item-description');
        menuItemHeader.classList.remove('active-menu-item-description');

        //check if menu item has sub menu items
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        if (subMenuItemContainer) {
            subMenuItemContainer.classList.remove('active-sub-menu-item-container');
        }
    })

    //add active class to the active menu item
    menuItems[activeMenuItemIndex].querySelector('.menu-item-icon').classList.add('active-menu-item-icon');
    menuItems[activeMenuItemIndex].querySelector('.menu-item-description').classList.add('active-menu-item-description');
    if (menuItems[activeMenuItemIndex].querySelector('.sub-menu-item-container')) {
        menuItems[activeMenuItemIndex].querySelector('.sub-menu-item-container').classList.add('active-sub-menu-item-container');
    }
}

function updateActiveSubMenuItemStyle() {

    const activeMenuItem = getActiveMenuItem();
    if (activeMenuItem.subMenuItemCount === NO_SUB_MENU_ITEM_COUNT) {
        log(LOG_TYPE.WARNING, 'No sub menu items');

        return;
    }

    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);

    //first remove active class from all menu items
    subMenuItems.forEach(subMenuItem => {
        //Scale up the active sub menu item icon
        const subMenuItemIcon = subMenuItem.querySelector('.sub-menu-item-icon');
        subMenuItemIcon.classList.remove('active-sub-menu-item-icon');

        //Play header text signal animation
        const subMenuHeader = subMenuItem.querySelector('.sub-menu-item-header');
        subMenuHeader.classList.remove('active-sub-menu-item-header');
    })

    //add active class to the active menu item
    subMenuItems[activeMenuItem.activeSubMenuItemIndex].querySelector('.sub-menu-item-icon').classList.add('active-sub-menu-item-icon');
    subMenuItems[activeMenuItem.activeSubMenuItemIndex].querySelector('.sub-menu-item-header').classList.add('active-sub-menu-item-header');
}

function toggleStatusBar() {
    isStatusBarVisible = !isStatusBarVisible;
    const statusBar = document.querySelector('.status-bar');
    statusBar.style.display = isStatusBarVisible ? 'block' : 'none';
}

function getActiveMenuItem() {
    return menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
}

function waitForAllTransitions(elements){
    return new Promise((resolve) => {
        let completedTransitions = 0;
        const totalTransitions = elements.length;

        const onTransitionEnd = (event) => {
            completedTransitions++;
            if (completedTransitions === totalTransitions) {
                elements.forEach((el) => el.removeEventListener('transitionend', onTransitionEnd));
                resolve();
            }
        };

        elements.forEach((element) => {
            element.addEventListener('transitionend', onTransitionEnd);
        });
    });
}

buildMenuItemsData();
addBodyListener();
