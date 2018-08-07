import {SuggestSource} from '../extension/SuggestSource';
import {Dict, SuggestItem} from '../extension/interfaces';
import {xhrRequest} from '../extension/util/xhrRequest';
import {getSearchVariants} from '../extension/util/searchVariants';

const PAGE_SIZE = 30;

export class UsersSuggestSource extends SuggestSource {
    private initialData: any[];
    private data: any[];
    private term: string;
    private values: SuggestItem[];
    private page: number;

    constructor(initialData?: any[]) {
        super();

        this.initialData = initialData || [];
    }

    fetch(term: string, page?: number): Promise<Dict[]> {
        return xhrRequest({
            method: 'GET',
            url: window.__HOST + '/api/user/hint.php',
            params: {
                q: term,
                p: page,
                ps: PAGE_SIZE
            }
        }).then(({data}) => data);
    }

    serialize(data: any[]): SuggestItem[] {
        return data.map((item: any[]) => {
            return {
                id: item[0],
                image: item[3],
                title: item[1],
                subtitle: item[2]
            };
        });
    }

    search(term: string, values: SuggestItem[], page: number = 1): Promise<SuggestItem[]> {
        let items = this.findFromCache(term, page),
            localSample = this.filterValues(items, values);

        this.term = term;
        this.values = values;
        this.page = page;

        // enough to display
        if (localSample.length === PAGE_SIZE) {
            this.data = localSample;

            return Promise.resolve(this.serialize(localSample));
        }

        // if not enough to display, try to fill with uniq data from server
        return this.fetch(term, page).then((data) => {
            let filterData = this.filterValues(data, values),
                uniqConcat = localSample.concat(filterData.filter((item) => {
                    return !localSample.find((sample) => sample[0] === item[0]);
                }));

            this.data = uniqConcat;

            return this.serialize(uniqConcat);
        });
    }

    hasNextPage() {
        return this.data.length >= PAGE_SIZE;
    }

    nextPage() {
        if (!this.hasNextPage()) {
            return Promise.resolve([]);
        }

        return this.search(this.term, this.values, this.page + 1);
    }

    findFromCache(term: string, page: number) {
        let offset = (page * PAGE_SIZE) - PAGE_SIZE,
            end = offset + PAGE_SIZE;

        if (!term.trim()) {
            return this.initialData.slice(offset, end);
        }

        let variants = getSearchVariants(term);

        return this.initialData.filter((item) => this.searchCondition(item, variants)).slice(offset, end);
    }

    searchCondition(item: any[], variants: string[]) {
        let name = item[1].toLowerCase();

        return variants.some((term) => name.indexOf(term) !== -1);
    }

    filterValues(arr: any[], values: SuggestItem[]): any[] {
        if (!values.length) {
            return arr;
        }

        return arr.filter((item) => !values.find((value) => value.id === item[0]));
    }

    highlight(str: string, term: string): string[] {
        if (term.trim()) {
            let strLower = str.toLowerCase(),
                variants = getSearchVariants(term),
                matched = '',
                index = -1;

            variants.forEach((variant) => {
                if (index === -1) {
                    index = strLower.indexOf(variant);

                    matched = variant;
                }
            });

            if (matched && index !== -1) {
                let limit = index + matched.length;

                return [
                    str.substring(0, index),
                    str.substring(index, limit),
                    str.substring(limit, str.length)
                ]
            }
        }

        return [str];
    }
}