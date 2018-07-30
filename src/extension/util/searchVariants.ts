import {Dict} from '../interfaces';

const ENG_TABLE = {
    'a': 'а',
    'b': 'б',
    'v': 'в',
    'g': 'г',
    'd': 'д',
    'e': 'е',
    'z': 'з',
    'i': 'и',
    'k': 'к',
    'l': 'л',
    'm': 'м',
    'n': 'н',
    'o': 'о',
    'p': 'п',
    'r': 'р',
    's': 'с',
    't': 'т',
    'u': 'у',
    'f': 'ф',
    'h': 'х',
    'c': 'ц'
};

const KBR_MISS_TABLE = {
    'f': 'а',
    ',': 'б',
    '<': 'б',
    'd': 'в',
    'u': 'г',
    'l': 'д',
    't': 'е',
    '\\': 'ё',
    '|': 'ё',
    ';': 'ж',
    ':': 'ж',
    'p': 'з',
    'b': 'и',
    'q': 'й',
    'r': 'к',
    'k': 'л',
    'v': 'м',
    'y': 'н',
    'j': 'о',
    'g': 'п',
    'h': 'р',
    'c': 'с',
    'n': 'т',
    'e': 'у',
    'a': 'ф',
    '[': 'х',
    '{': 'х',
    'w': 'ц',
    'x': 'ч',
    'i': 'ш',
    'o': 'щ',
    ']': 'ъ',
    '}': 'ъ',
    's': 'ы',
    'm': 'ь',
    '\'': 'э',
    '"': 'э',
    '.': 'ю',
    '>': 'ю',
    'z': 'я'
};

const REV_KBR_MISS_TABLE = {
    'ф': 'а',
    'и': 'б',
    'м': 'в',
    'п': 'г',
    'в': 'д',
    'у': 'е',
    'я': 'з',
    'ш': 'и',
    'л': 'к',
    'д': 'л',
    'ь': 'м',
    'т': 'н',
    'щ': 'о',
    'з': 'п',
    'к': 'р',
    'ы': 'с',
    'е': 'т',
    'г': 'у',
    'а': 'ф',
    'р': 'х',
    'с': 'ц'
}

let memo: Dict = {};

function mapFromTable(str: string, table: Dict): string {
    let strlen = str.length,
        result: string[] = [];

    for (let i = 0; i < strlen; i++) {
        let char = str[i];

        result.push(table[char] || char);
    }

    return result.join('');
}

export function getSearchVariants(str: string): string[] {
    if (!memo[str]) {
        memo[str] = [
            str,
            mapFromTable(str, ENG_TABLE),
            mapFromTable(str, KBR_MISS_TABLE),
            mapFromTable(str, REV_KBR_MISS_TABLE)
        ].filter((value, index, self) => self.indexOf(value) === index);
    }

    return memo[str];
}
