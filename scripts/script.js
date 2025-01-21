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

/**
 * Builds menu items data. 
 * It is used to keep track of menu items and sub menu items
 */
function buildMenuItemsData() {
    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach((menuItem, index) => {
        // Get sub menu item count
        // First get sub menu items container
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        let subMenuItemCount = subMenuItemContainer ?
            subMenuItemContainer.children.length
            : NO_SUB_MENU_ITEM_COUNT;

        // Get menu item index
        const menuItemIndex = index;
        // By default active sub menu item index is 0
        // This is used to keep track of active sub menu item index
        const activeSubMenuItemIndex = 0;

        menuItemsData.push(
            {
                subMenuItemCount,
                menuItemIndex,
                activeSubMenuItemIndex,
                subMenuItemContainer,
            });
    });
}

/**
 * Adds event listener to the body
 * All interactions are handled here
 */
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

    // Start transitioning
    isTransitioningHorizontally = true;

    // Change active menu item index
    changeActiveMenuItemIndex(direction);

    // Change style of active menu item
    updateStyleActiveMenuItem();

    await Sfx.playClick();

    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach((menuItem) => {
        const currentTranslateX = getTranslateX(menuItem);
        menuItem.style.transform = `translateX(${currentTranslateX + (HORIZONTAL_MOVEMENT_AMOUNT * -direction)}px)`;
    });

    // Wait for the transition to complete
    await waitForAllTransitions(menuItems);

    // End transitioning
    isTransitioningHorizontally = false;
}

async function moveSubMenuItemsVertically(direction) {
    const activeMenuItem = menuItemsData.find(item => item.menuItemIndex === activeMenuItemIndex);
    const subMenuItemsCount = activeMenuItem.subMenuItemCount;
    const activeSubMenuItemIndex = activeMenuItem.activeSubMenuItemIndex;

    //Check if menu item has sub menu items
    if (!activeMenuItem.subMenuItemCount === NO_SUB_MENU_ITEM_COUNT) {
        log(LOG_TYPE.WARNING, 'No sub menu items');

        return;
    }

    if (!(direction === DIRECTION.Down && activeSubMenuItemIndex < subMenuItemsCount - 1 || direction === DIRECTION.Up && activeSubMenuItemIndex > 0)) {
        log(LOG_TYPE.WARNING, 'Can not move vertically');

        return;
    }

    if (isTransitioningVertically) {
        log(LOG_TYPE.WARNING, 'Transitioning');

        return;
    }

    //Start transitioning
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

    //End transitioning
    isTransitioningVertically = false;
}

/**
 * 
 * @param {Element} element 
 * @returns x coordinate of the element
 */
function getTranslateX(element) {
    const style = window.getComputedStyle(element);
    const matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41;
}

/**
 * 
 * @param {Element} element 
 * @returns y coordinate of the element
 */
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
    //Get active sub menu item index
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

    // remove active class from all menu items
    menuItems.forEach(menuItem => {
        menuItem.classList.remove('active-menu-item');
    })

    // add active class to the active menu item
    menuItems[activeMenuItemIndex].classList.add('active-menu-item');
}

function updateActiveSubMenuItemStyle() {

    //Get active menu item
    const activeMenuItem = getActiveMenuItem();
    if (activeMenuItem.subMenuItemCount === NO_SUB_MENU_ITEM_COUNT) {
        log(LOG_TYPE.WARNING, 'No sub menu items');

        return;
    }

    //Get all sub menu items
    const subMenuItems = Array.from(activeMenuItem.subMenuItemContainer.children);

    //Remove active class from all menu items
    subMenuItems.forEach(subMenuItem => {
        subMenuItem.classList.remove('active-sub-menu-item');
    })

    //Add active class to the active menu item
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

/**
 * waits for all transitions to complete
 * !IMPORTANT!: If all transitions are not awaited, 
 * this causes some elements not position correctly. 
 * Very crucial function for the transitions.
 * @param {any[]} elements 
 */
function waitForAllTransitions(elements) {
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

/**
 * Setup active menu item at startup
 */
function setupActiveMenuItem() {
    const activeMenuItem = document.querySelector('.menu-item');
    activeMenuItem.classList.add('active-menu-item');
}

/**
 * Setup active sub menu items at startup
 */
function setupActiveSubMenuItems() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((menuItem) => {
        const subMenuItemContainer = menuItem.querySelector('.sub-menu-item-container');
        //Check if menu item has sub menu items
        if (!subMenuItemContainer || subMenuItemContainer.children.length === 0) {
            return;
        }
        const firstSubMenuItem = subMenuItemContainer.children[0];
        firstSubMenuItem.classList.add('active-sub-menu-item');
    });
}

buildMenuItemsData();
addBodyListener();
setupActiveMenuItem();
setupActiveSubMenuItems();
