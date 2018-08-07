import {PureSuggest} from './extension';
import {SuggestItem} from './interfaces';

function createTestSource(returns: SuggestItem[] = []) {
    return {
        fetch(_term: string) {
            return Promise.resolve(returns);
        },
        serialize(data: any) {
            return data as SuggestItem[];
        },
        search(term: string) {
            return this.fetch(term).then((data: any) => this.serialize(data));
        },
        hasNextPage() {
            return false;
        },
        nextPage() {
            return Promise.resolve([]);
        },
        highlight(str: string) {
            return [str];
        }
    };
}

function triggerMouseEvent(node: Element, eventType: string) {
    var clickEvent = document.createEvent('MouseEvents');

    clickEvent.initEvent(eventType, true, true);

    node.dispatchEvent(clickEvent);
}

describe('extension', function () {
    let el: HTMLDivElement,
        input: HTMLInputElement,
        suggest: PureSuggest;

    beforeEach(function () {
        el = document.createElement('div');
        input = document.createElement('input');

        el.className = 'suggest';
        input.className = 'suggest__input';

        el.appendChild(input);
        document.body.appendChild(el);
    });

    afterEach(function () {
        if (suggest) {
            suggest.destroy();
        }

        document.body.removeChild(el);
    });

    it('should create extension with minimal config', function () {
        suggest = new PureSuggest(el, {
            createSource: () => createTestSource()
        });

        expect(el.className).toBe('suggest');
        expect(input.className).toBe('suggest__input');
        expect(el.querySelector('suggest__toggle')).toBeDefined();
    });

    it('should show menu if typed some text', function (done) {
        suggest = new PureSuggest(el, {
            createSource: () => createTestSource([{
                id: '1',
                title: 'title1',
                subtitle: 'subtitle1'
            }, {
                id: '2',
                title: 'title2',
                subtitle: 'subtitle2'
            }])
        });

        input.focus();
        input.value = 'text';
        input.dispatchEvent(new Event('input'));

        setTimeout(() => {
            let menu = el.querySelector('.suggest__menu');

            expect(menu).toBeDefined();
            expect(menu.childNodes.length).toBe(2);

            let firstItem = menu.childNodes[0] as Element;

            expect(firstItem.querySelector('.suggest-item__title').textContent).toBe('title1');
            expect(firstItem.querySelector('.suggest-item__subtitle').textContent).toBe('subtitle1');

            done();
        }, 300);
    });

    it('should support multi-select', function (done) {
        suggest = new PureSuggest(el, {
            multi: true,
            createSource: () => createTestSource([{
                id: '1',
                title: 'title1',
                subtitle: 'subtitle1'
            }, {
                id: '2',
                title: 'title2',
                subtitle: 'subtitle2'
            }])
        });

        input.focus();
        input.value = 'text';
        input.dispatchEvent(new Event('input'));

        setTimeout(() => {
            let firstChild = el.querySelector('.suggest__menu').childNodes[0] as Element;

            triggerMouseEvent(firstChild, 'mousedown');

            let bubbles = el.querySelector('.suggest__bubbles');

            expect(bubbles.childNodes.length).toBe(1);

            done();
        }, 300);
    });
});