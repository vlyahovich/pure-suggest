import {SuggestSource} from '../extension/SuggestSource';
import {Dict, SuggestItem} from '../extension/interfaces';
import {xhrRequest} from '../extension/util/xhrRequest';
import {getSearchVariants} from '../extension/util/searchVariants';

const SAMPLE_SIZE = 5;

export class UsersSuggestSource extends SuggestSource {
    private initialData: any[];
    private data: any[];

    constructor(initialData?: any[]) {
        super();

        this.initialData = initialData || [];
    }

    fetch(term: string): Promise<Dict[]> {
        return xhrRequest({
            method: 'GET',
            url: '/pure-suggest/api/user/hint.php',
            params: {
                q: term
            }
        }).then(({data}) => {
            this.data = data;

            return data;
        });
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

    search(term: string, values: SuggestItem[]): Promise<SuggestItem[]> {
        let items = this.findFromCache(term),
            localSample = this.filterValues(items, values).slice(0, SAMPLE_SIZE);

        // enough to display
        if (localSample.length === SAMPLE_SIZE) {
            return Promise.resolve(this.serialize(localSample));
        }

        // if not enough to display, try to fill with uniq data from server
        return this.fetch(term).then((data) => {
            let filterData = this.filterValues(data, values),
                uniqConcat = localSample.concat(filterData.filter((item) => {
                    return !localSample.find((sample) => sample[0] === item[0]);
                }));

            return this.serialize(uniqConcat.slice(0, SAMPLE_SIZE));
        });
    }

    findFromCache(term: string) {
        if (!term.trim()) {
            return this.initialData;
        }

        let variants = getSearchVariants(term);

        return this.initialData.filter((item) => this.searchCondition(item, variants));
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

    find(id: string): any {
        return this.data.find((item) => item[0] === id);
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