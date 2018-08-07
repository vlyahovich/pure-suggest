import {Dict, SuggestItem} from './interfaces';

export abstract class SuggestSource {
    abstract fetch(term: string): Promise<Dict[]>;

    abstract serialize(data: Dict[]): SuggestItem[];

    abstract search(term: string, values: SuggestItem[]): Promise<SuggestItem[]>;

    abstract hasNextPage(): boolean;

    abstract nextPage(): Promise<SuggestItem[]>;

    abstract highlight(str: string, term: string): string[];
}