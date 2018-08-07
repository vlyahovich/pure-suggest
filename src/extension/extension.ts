import {SuggestItem} from './interfaces';
import {SuggestSource} from './SuggestSource';
import {EventEmitter} from './EventEmitter';
import {debounce} from './util/debounce';
import {throttle} from './util/throttle';
import {bind} from './util/bindDecorator';
import {KEYS} from './enums';

import './extension.less';

export interface ExtensionOptions {
    hideAvatar?: boolean,
    multi?: boolean,
    initialData?: any[],
    createSource: (initialData?: any[]) => SuggestSource
}

const USER_NOT_FOUND = 'User not found';
const ADD = 'Add';
const FOCUSED = 'suggest_focused';
const FILLED = 'suggest_filled';
const INPUT = 'suggest__input';
const TOGGLE = 'suggest__toggle';
const ITEM_HOVERED = 'suggest-item_hovered';
const NOT_FOUND = 'suggest__not-found';
const MENU = 'suggest__menu';
const MENU_WRAP = 'suggest__menu-wrap';
const ITEM = 'suggest-item';
const ITEM_IMAGE = 'suggest-item__image';
const ITEM_IMAGE_LOADED = 'suggest-item__image_loaded';
const ITEM_TITLE = 'suggest-item__title';
const ITEM_SUBTITLE = 'suggest-item__subtitle';
const BUBBLES = 'suggest__bubbles';
const BUBBLES_ADD = 'suggest__add';
const BUBBLE = 'suggest-bubble';
const BUBBLE_TEXT = 'suggest-bubble__text';
const BUBBLE_CLOSE = 'suggest-bubble__close';
const SEARCH_DEBOUNCE = 250;
const SCROLL_THROTTLE = 200;
const SCROLL_THRESHOLD = 1000;

export class PureSuggest extends EventEmitter {
    protected el: HTMLElement;
    protected input: HTMLInputElement;
    protected suggestSource: SuggestSource;
    protected focused: boolean = false;
    protected toggle: boolean = false;
    protected toggleEl?: HTMLDivElement;
    protected menuWrapEl?: HTMLDivElement;
    protected menuEl?: HTMLDivElement;
    protected menuScrollHeight?: number;
    protected menuItems?: HTMLDivElement[];
    protected suggestItems?: SuggestItem[];
    protected bubblesEl?: HTMLDivElement;
    protected addEl?: HTMLDivElement;
    protected index: number = 0;
    protected options: ExtensionOptions;
    protected value: SuggestItem[] = [];
    protected doDelayedSearch: () => any;
    protected currentRequest: Promise<any> | void;

    constructor(el: HTMLDivElement, options: ExtensionOptions) {
        super();

        if (!el) {
            throw new Error('element is required');
        }

        if (!options || !options.createSource) {
            throw new Error('createSource is required');
        }

        // init
        this.el = el;
        this.input = this.el.querySelector('.' + INPUT);
        this.toggleEl = this.el.querySelector('.' + TOGGLE);
        this.suggestSource = options.createSource(options.initialData);
        this.options = options;

        this.initElements();

        // util
        this.doDelayedSearch = debounce(this.doSearch, SEARCH_DEBOUNCE);
        this.handleMenuScroll = throttle(this.handleMenuScroll, SCROLL_THROTTLE);

        // listeners
        this.el.addEventListener('mousedown', this.handleMouseDown);
        this.el.addEventListener('click', this.handleClick);
        this.input.addEventListener('keydown', this.handleKeyDown);
        this.input.addEventListener('input', this.doDelayedSearch);
        this.input.addEventListener('focus', this.handleFocus);
        this.input.addEventListener('blur', this.handleBlur);
    }

    /**
     * Init some elements if needed
     */
    initElements() {
        // in case we need to create input by extension
        if (!this.input) {
            this.input = document.createElement('input');

            this.input.className = INPUT;

            // element can be filled with some additional nodes, clear it
            this.el.innerHTML = '';
            this.el.appendChild(this.input);
        }

        // in case we need to create toggle by extension
        if (!this.toggleEl) {
            this.toggleEl = document.createElement('div');

            this.toggleEl.className = TOGGLE;

            this.el.insertBefore(this.toggleEl, this.input);
        }
    }

    /**
     * Handle mousedown for proper toggle behaviour
     */
    @bind
    handleMouseDown() {
        if (this.focused) {
            this.toggle = true;
        }
    }

    /**
     * Handle click on element itself to focus back
     */
    @bind
    handleClick(event: Event) {
        // just let input blur if toggle happened
        if (event.target === this.toggleEl && this.toggle) {
            this.toggle = false;

            return;
        }

        if (this.options.multi) {
            this.input.style.display = '';
        }

        this.input.focus();
    }

    /**
     * Handle command keys
     */
    @bind
    handleKeyDown(event: KeyboardEvent) {
        let key = event.which || event.keyCode;

        if (key === KEYS.UP) {
            this.handleUp();
        } else if (key === KEYS.DOWN) {
            this.handleDown();
        } else if (key === KEYS.ENTER) {
            this.handleSelect();
        } else if (key === KEYS.ESC) {
            this.handleEsc();
        } else {
            return;
        }

        event.preventDefault();
    }

    /**
     * Focus state
     */
    @bind
    handleFocus() {
        this.focused = true;

        this.el.classList.add(FOCUSED);

        if (this.options.multi && this.addEl) {
            this.addEl.style.display = 'none';
        }

        this.doSearch();

        this.trigger('focus');
    }

    /**
     * Blur state
     */
    @bind
    handleBlur() {
        this.focused = false;

        // reset menu
        if (this.menuEl) {
            this.menuEl.scrollTop = 0;
            this.menuEl.style.display = 'none';
        }

        this.el.classList.remove(FOCUSED);

        // toggle input and add element visibilities for multi-select
        if (this.options.multi && !this.input.value) {
            if (this.value.length) {
                this.input.style.display = 'none';
            } else {
                this.input.style.display = '';
            }

            if (this.addEl) {
                this.addEl.style.display = '';
            }
        }

        this.trigger('blur');
    }

    /**
     * Handle KEYS.UP key
     */
    handleUp() {
        if (!this.menuItems || this.index <= 0 || !this.focused) {
            return;
        }

        this.updateHovered(this.index - 1);
    }

    /**
     * Handle KEYS.DOWN key
     */
    handleDown() {
        if (!this.menuItems || this.index >= this.menuItems.length - 1 || !this.focused) {
            return;
        }

        this.updateHovered(this.index + 1);
    }

    /**
     * Handle KEYS.ENTER key
     */
    handleSelect() {
        if (!this.menuItems || !this.focused) {
            return;
        }

        let id = this.menuItems[this.index].getAttribute('data-id');

        this.setValue(id);

        this.input.blur();
    }

    /**
     * Handle KEYS.ESCAPE key
     */
    handleEsc() {
        this.input.blur();
    }

    /**
     * Return trimmed input value
     */
    getInputValue() {
        return this.input.value.trim();
    }

    /**
     * Update input value and ui state
     */
    setValue(id: string) {
        let item = this.suggestItems[this.index];

        this.index = 0;

        if (this.options.multi) {
            this.input.value = '';

            this.value.push(item);

            this.addBubble(item);
        } else {
            this.input.value = item.title;

            this.value = [item];

            this.trigger('change', id);
        }
    }

    /**
     * Search from suggest source
     */
    @bind
    doSearch() {
        this.suggestSource
            .search(this.getInputValue(), this.options.multi ? this.value : [])
            .then((items) => this.updateMenu(items));
    }

    /**
     * Handle click on item in menu
     */
    @bind
    handleItemClick(event: Event) {
        let item = this.findDataItem(event.target as Element) as HTMLDivElement;

        if (item) {
            let id = item.getAttribute('data-id');

            this.updateHovered(this.menuItems.indexOf(item));

            this.setValue(id);
        }
    }

    /**
     * Handle item mouse move
     */
    @bind
    handleItemMove(event: Event) {
        let item = this.findDataItem(event.target as Element) as HTMLDivElement;

        if (item) {
            this.updateHovered(this.menuItems.indexOf(item));
        }
    }

    /**
     * Handle when menu scrolls
     */
    @bind
    handleMenuScroll() {
        if (this.currentRequest || !this.suggestSource.hasNextPage()) {
            return;
        }

        let {scrollTop} = this.menuEl,
            {value} = this.input;

        if (this.menuScrollHeight - scrollTop < SCROLL_THRESHOLD) {
            this.currentRequest = this.suggestSource
                .nextPage()
                .then((items) => {
                    // make sure input isn't changed and add new items
                    if (value === this.input.value) {
                        this.addMenu(items);

                        this.currentRequest = null;
                    }
                });
        }
    }

    /**
     * Handle close button click on bubble
     */
    @bind
    handleBubbleClose(event: Event) {
        let target = event.target as Element;

        event.stopPropagation();

        if (target.className === BUBBLE_CLOSE) {
            let item = this.findDataItem(event.target as Element) as HTMLDivElement;

            if (item) {
                this.removeBubble(item);
            }
        }
    }

    /**
     * Stop events on bubble click
     */
    @bind
    handleBubbleClick(event: Event) {
        event.stopPropagation();
    }

    /**
     * Find parent menu item
     */
    findDataItem(target: Element): Element | void {
        let el = target,
            check = () => el && el.getAttribute && el.getAttribute('data-id');

        if (check()) {
            return el;
        }

        while (el.parentNode) {
            el = el.parentNode as Element;

            if (check()) {
                return el;
            }
        }
    }

    /**
     * Update index and hovered menu item
     */
    updateHovered(index: number) {
        this.menuItems[this.index].classList.remove(ITEM_HOVERED);

        this.index = index;

        this.menuItems[this.index].classList.add(ITEM_HOVERED);
    }

    /**
     * Create menu if needed, create items according to suggest data
     */
    updateMenu(items: SuggestItem[]) {
        let term = this.getInputValue();

        this.menuItems = [];
        this.suggestItems = items;

        this.createMenu();

        if (items.length) {
            let fragment = document.createDocumentFragment();

            this.index = 0;

            items.forEach((item) => this.createMenuItem(item, fragment, term));

            this.menuEl.appendChild(fragment);

            this.updateHovered(this.index);
        } else {
            let notFoundEl = document.createElement('div');

            notFoundEl.className = NOT_FOUND;
            notFoundEl.textContent = USER_NOT_FOUND;

            this.menuEl.appendChild(notFoundEl);
        }

        this.menuScrollHeight = this.menuEl.scrollHeight;
    }

    /**
     * Add items to existing menu
     */
    addMenu(items: SuggestItem[]) {
        if (!this.menuEl) {
            return;
        }

        let term = this.getInputValue();

        this.suggestItems = this.suggestItems.concat(items);

        if (items.length) {
            let fragment = document.createDocumentFragment();

            items.forEach((item) => this.createMenuItem(item, fragment, term));

            this.menuEl.appendChild(fragment);
        }

        this.menuScrollHeight = this.menuEl.scrollHeight;
    }

    /**
     * Create or update menu element
     */
    createMenu() {
        if (this.menuEl) {
            this.menuEl.innerHTML = '';
            this.menuEl.style.display = '';
            this.menuEl.scrollTop = 0;
        } else {
            this.menuWrapEl = document.createElement('div');
            this.menuEl = document.createElement('div');

            this.menuWrapEl.className = MENU_WRAP;
            this.menuEl.className = MENU;

            this.el.appendChild(this.menuWrapEl);
            this.menuWrapEl.appendChild(this.menuEl);

            this.menuEl.addEventListener('mousedown', this.handleItemClick);
            this.menuEl.addEventListener('mousemove', this.handleItemMove);
            this.menuEl.addEventListener('scroll', this.handleMenuScroll);
        }
    }

    /**
     * Create one menu item
     */
    createMenuItem(item: SuggestItem, fragment: DocumentFragment, term: string) {
        let menuItemEl = document.createElement('div'),
            titleEl = document.createElement('div'),
            subtitleEl = document.createElement('div'),
            highlight = this.suggestSource.highlight(item.title, term);

        if (!this.options.hideAvatar && item.image) {
            let imageWrapEl = document.createElement('div'),
                imageEl = document.createElement('img'),
                image = new Image();

            imageEl.setAttribute('src', item.image);
            imageEl.setAttribute('alt', item.title);

            imageWrapEl.className = ITEM_IMAGE;

            imageWrapEl.appendChild(imageEl);
            menuItemEl.appendChild(imageWrapEl);

            // load actual image
            image.onload = () => imageWrapEl.classList.add(ITEM_IMAGE_LOADED);
            image.src = item.image;
        }

        menuItemEl.className = ITEM;
        titleEl.className = ITEM_TITLE;
        subtitleEl.className = ITEM_SUBTITLE;

        if (highlight.length <= 1) {
            titleEl.textContent = item.title;
        } else {
            this.createHighlight(titleEl, highlight);
        }

        subtitleEl.textContent = item.subtitle;

        menuItemEl.appendChild(titleEl);
        menuItemEl.appendChild(subtitleEl);

        menuItemEl.setAttribute('data-id', String(item.id));

        fragment.appendChild(menuItemEl);

        this.menuItems.push(menuItemEl);
    }

    /**
     * Create highlight for one item
     */
    createHighlight(titleEl: HTMLDivElement, highlight: string[]) {
        if (highlight[1] && highlight[1].trim()) {
            let preEl = document.createTextNode(highlight[0]),
                hlEl = document.createElement('span');

            hlEl.textContent = highlight[1];

            titleEl.appendChild(preEl);
            titleEl.appendChild(hlEl);

            if (highlight[2]) {
                let postEl = document.createTextNode(highlight[2]);

                titleEl.appendChild(postEl);
            }
        } else {
            titleEl.textContent = highlight[0];
        }
    }

    /**
     * Add bubble for multi-suggest
     */
    addBubble(item: SuggestItem) {
        if (!this.bubblesEl) {
            this.bubblesEl = document.createElement('div');
            this.addEl = document.createElement('div');

            this.bubblesEl.className = BUBBLES;
            this.addEl.className = BUBBLES_ADD;

            this.addEl.textContent = ADD;

            this.el.insertBefore(this.bubblesEl, this.input);
            this.el.insertBefore(this.addEl, this.input);

            this.bubblesEl.addEventListener('mousedown', this.handleBubbleClose);
            this.bubblesEl.addEventListener('click', this.handleBubbleClick);
        }

        let bubbleEl = document.createElement('div'),
            bubbleTextEl = document.createElement('div'),
            bubbleCloseEl = document.createElement('div');

        bubbleEl.className = BUBBLE;
        bubbleTextEl.className = BUBBLE_TEXT;
        bubbleCloseEl.className = BUBBLE_CLOSE;

        bubbleEl.setAttribute('data-id', item.id);

        bubbleTextEl.textContent = item.title;

        bubbleEl.appendChild(bubbleTextEl);
        bubbleEl.appendChild(bubbleCloseEl);
        this.bubblesEl.appendChild(bubbleEl);

        this.el.classList.add(FILLED);

        this.trigger('change', this.value.map(({id}) => id));
    }

    /**
     * Remove bubble for multi-suggest
     */
    removeBubble(bubble: HTMLDivElement) {
        let id = bubble.getAttribute('data-id');

        if (id) {
            this.bubblesEl.removeChild(bubble);

            this.value = this.value.filter((item) => item.id !== id);

            if (!this.value.length) {
                this.el.classList.remove(FILLED);

                this.input.style.display = '';
            }

            this.trigger('change', this.value.map(({id}) => id));
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        // clear options
        this.suggestSource = null;
        this.options = null;

        // clear listeners and childs
        this.el.removeEventListener('mousedown', this.handleMouseDown);
        this.el.removeEventListener('click', this.handleClick);
        this.input.removeEventListener('keydown', this.handleKeyDown);
        this.input.removeEventListener('input', this.doDelayedSearch);
        this.input.removeEventListener('focus', this.handleFocus);
        this.input.removeEventListener('blur', this.handleBlur);

        if (this.menuEl) {
            this.menuEl.removeEventListener('mousedown', this.handleItemClick);
            this.menuEl.removeEventListener('mousemove', this.handleItemMove);
            this.menuEl.removeEventListener('scroll', this.handleMenuScroll);
        }

        if (this.bubblesEl) {
            this.bubblesEl.removeEventListener('mousedown', this.handleBubbleClose);
            this.bubblesEl.removeEventListener('click', this.handleBubbleClick);

            this.el.removeChild(this.bubblesEl);
            this.el.removeChild(this.addEl);
        }

        if (this.menuWrapEl) {
            this.el.removeChild(this.menuWrapEl);
        }

        // clear elements linked from outside
        this.el = null;
        this.input = null;
        this.toggleEl = null;

        // clear events
        this.events = {};
    }
}