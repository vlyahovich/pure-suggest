import {SuggestItem} from './interfaces';
import {SuggestSource} from './SuggestSource';
import {EventEmitter} from './util/EventEmitter';
import {debounce} from './util/debounce';
import {KEYS} from './enums';

import './extension.less';

export interface ExtensionOptions {
    hideAvatar?: boolean,
    multi?: boolean,
    initialData?: any[],
    createSource: (initialData?: any[]) => SuggestSource
}

const FOCUSED = 'suggest_focused';
const ITEM_HOVERED = 'suggest-item_hovered';
const SEARCH_DEBOUNCE = 250;

export class PureSuggest extends EventEmitter {
    protected el: HTMLElement;
    protected input: HTMLInputElement;
    protected suggestSource: SuggestSource;
    protected focused: boolean = false;
    protected menuWrapEl?: HTMLDivElement;
    protected menuEl?: HTMLDivElement;
    protected menuItems?: HTMLDivElement[];
    protected suggestItems?: SuggestItem[];
    protected bubblesEl?: HTMLDivElement;
    protected addEl?: HTMLDivElement;
    protected index: number = 0;
    protected options: ExtensionOptions;
    protected value: SuggestItem[] = [];
    protected doImmSearch: Function;

    constructor(el: HTMLDivElement, options: ExtensionOptions) {
        super();

        if (!options || !options.createSource) {
            throw new Error('createSource is required');
        }

        // init
        this.el = el;
        this.input = this.el.querySelector('.suggest__input');
        this.suggestSource = options.createSource(options.initialData);
        this.options = options;

        // bindings
        this.handleSelfClick = this.handleSelfClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.doImmSearch = this.doSearch.bind(this);
        this.doSearch = debounce(this.doImmSearch, SEARCH_DEBOUNCE);
        this.handleItemClick = this.handleItemClick.bind(this);
        this.handleItemMove = this.handleItemMove.bind(this);
        this.handleBubbleClose = this.handleBubbleClose.bind(this);
        this.handleBubbleClose = this.handleBubbleClose.bind(this);

        // listeners
        this.el.addEventListener('click', this.handleSelfClick);
        this.input.addEventListener('keydown', this.handleKeyDown);
        this.input.addEventListener('input', this.doSearch);
        this.input.addEventListener('focus', this.handleFocus);
        this.input.addEventListener('blur', this.handleBlur);
    }

    /**
     * Hnndle click on element itself to focus back
     */
    handleSelfClick() {
        if (this.options.multi) {
            this.input.style.display = '';
        }

        this.input.focus();
    }

    /**
     * Handle command keys
     */
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
    handleFocus() {
        this.focused = true;

        this.el.classList.add(FOCUSED);

        if (this.options.multi && this.addEl) {
            this.addEl.style.display = 'none';
        }

        this.doImmSearch();

        this.trigger('focus');
    }

    /**
     * Blur state
     */
    handleBlur() {
        this.focused = false;

        this.el.classList.remove(FOCUSED);

        if (this.options.multi) {
            if (this.value.length) {
                this.input.style.display = 'none';
            } else {
                this.input.style.display = '';
            }

            if (this.addEl) {
                this.addEl.style.display = '';
            }
        }

        if (this.menuEl) {
            this.menuEl.style.display = 'none';
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
        if (!this.menuItems) {
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
    doSearch() {
        this.suggestSource
            .search(this.getInputValue(), this.options.multi ? this.value : [])
            .then((items) => this.updateMenu(items));
    }

    /**
     * Handle click on item in menu
     */
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
    handleItemMove(event: Event) {
        let item = this.findDataItem(event.target as Element) as HTMLDivElement;

        if (item) {
            this.updateHovered(this.menuItems.indexOf(item));
        }
    }

    /**
     * Handle close button click on bubble
     */
    handleBubbleClose(event: Event) {
        let target = event.target as Element;

        event.stopPropagation();

        if (target.className === 'suggest-bubble__close') {
            let item = this.findDataItem(event.target as Element) as HTMLDivElement;

            if (item) {
                this.removeBubble(item);
            }
        }
    }

    /**
     * Stop events on bubble click
     */
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

        if (this.menuEl) {
            this.menuEl.innerHTML = '';
            this.menuEl.style.display = '';
        } else {
            this.menuWrapEl = document.createElement('div');
            this.menuEl = document.createElement('div');

            this.menuWrapEl.className = 'suggest__menu-wrap';
            this.menuEl.className = 'suggest__menu';

            this.el.appendChild(this.menuWrapEl);
            this.menuWrapEl.appendChild(this.menuEl);

            this.menuEl.addEventListener('mousedown', this.handleItemClick);
            this.menuEl.addEventListener('mousemove', this.handleItemMove);
        }

        if (items.length) {
            let fragment = document.createDocumentFragment();

            this.index = 0;

            items.forEach((item) => this.createMenuItem(item, fragment, term));

            this.menuEl.appendChild(fragment);

            this.updateHovered(this.index);
        } else {
            let notFoundEl = document.createElement('div');

            notFoundEl.className = 'suggest__not-found';
            notFoundEl.textContent = 'User not found';

            this.menuEl.appendChild(notFoundEl);
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

        if (!this.options.hideAvatar) {
            let imageWrapEl = document.createElement('div'),
                imageEl = document.createElement('img');

            imageEl.setAttribute('src', item.image);
            imageEl.setAttribute('alt', item.title);

            imageWrapEl.className = 'suggest-item__image';

            imageWrapEl.appendChild(imageEl);
            menuItemEl.appendChild(imageWrapEl);
        }

        menuItemEl.className = 'suggest-item';
        titleEl.className = 'suggest-item__title';
        subtitleEl.className = 'suggest-item__subtitle';

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

            this.bubblesEl.className = 'suggest__bubbles';
            this.addEl.className = 'suggest__add';

            this.addEl.textContent = 'Add';

            this.el.insertBefore(this.bubblesEl, this.input);
            this.el.insertBefore(this.addEl, this.input);

            this.bubblesEl.addEventListener('mousedown', this.handleBubbleClose);
            this.bubblesEl.addEventListener('click', this.handleBubbleClick);
        }

        let bubbleEl = document.createElement('div'),
            bubbleTextEl = document.createElement('div'),
            bubbleCloseEl = document.createElement('div');

        bubbleEl.className = 'suggest-bubble';
        bubbleTextEl.className = 'suggest-bubble__text';
        bubbleCloseEl.className = 'suggest-bubble__close';

        bubbleEl.setAttribute('data-id', item.id);

        bubbleTextEl.textContent = item.title;

        bubbleEl.appendChild(bubbleTextEl);
        bubbleEl.appendChild(bubbleCloseEl);
        this.bubblesEl.appendChild(bubbleEl);

        this.el.classList.add('suggest_filled');

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
                this.el.classList.remove('suggest_filled');

                this.input.style.display = '';
            }

            this.trigger('change', this.value.map(({id}) => id));
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.suggestSource = null;
        this.options = null;

        this.el.removeEventListener('click', this.handleSelfClick);
        this.input.removeEventListener('keydown', this.handleKeyDown);
        this.input.removeEventListener('input', this.doSearch);
        this.input.removeEventListener('focus', this.handleFocus);
        this.input.removeEventListener('blur', this.handleBlur);

        if (this.menuEl) {
            this.menuEl.removeEventListener('mousedown', this.handleItemClick);
            this.menuEl.removeEventListener('mousemove', this.handleItemMove);
        }

        if (this.bubblesEl) {
            this.bubblesEl.removeEventListener('mousedown', this.handleBubbleClose);
            this.bubblesEl.removeEventListener('click', this.handleBubbleClick);

            this.el.removeChild(this.bubblesEl);
            this.el.removeChild(this.addEl);
        }

        this.el.removeChild(this.menuWrapEl);

        this.el = null;
        this.input = null;
    }
}