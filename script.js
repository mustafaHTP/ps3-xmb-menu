addBodyListener();

const menuItemsMovementAmount = 100;
const menuItemCount = 3;
let selectedMenuItemIndex = 0;

function addBodyListener() {
    document.body.addEventListener('keydown', (event) => {

        let direction;

        if (event.key === 'ArrowLeft') {
            direction = 1;
            moveMenuItemsHorizontally(menuItemsMovementAmount * direction);
            changeSelectedMenuItem(-direction);
        }
        else if (event.key === 'ArrowRight') {
            direction = -1;
            moveMenuItemsHorizontally(menuItemsMovementAmount * direction);
            changeSelectedMenuItem(-direction);

        } else if (event.key === 'ArrowUp') {
            direction = 1;
            moveSelectionItemsVertically(menuItemsMovementAmount * direction);

        } else if (event.key === 'ArrowDown') {
            direction = -1;
            moveSelectionItemsVertically(menuItemsMovementAmount * direction);
        }

    });
}

function moveMenuItemsHorizontally(movementAmount) {
    // Get all menu items
    const menuItems = document.querySelectorAll('.menu-item');
    console.log(menuItems);

    menuItems.forEach((menuItem) => {
        const currentTranslateX = getTranslateX(menuItem);
        menuItem.style.transform = `translateX(${currentTranslateX + movementAmount}px)`;
    });
}

function moveSelectionItemsVertically(movementAmount) {
    //Get selected menu item
    const menuItems = document.querySelectorAll('.menu-item');
    const selectedMenuItem = menuItems[selectedMenuItemIndex];

    //Get selected menu item's children (selection items)
    const selectionItems = Array.from(selectedMenuItem.children);
    console.log(selectionItems);

    selectionItems.forEach((selectionItem) => {
        const currentTranslateY = getTranslateY(selectionItem);
        selectionItem.style.transform = `translateY(${currentTranslateY + movementAmount}px)`;
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

function changeSelectedMenuItem(direction) {
    if (direction === 1 && selectedMenuItemIndex < menuItemCount - 1) {
        selectedMenuItemIndex++;
    } else if (direction === -1 && selectedMenuItemIndex > 0) {
        selectedMenuItemIndex--;
    }

    console.log('Selected menu item: ', selectedMenuItemIndex);
}