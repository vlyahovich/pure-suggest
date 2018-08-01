import {getSearchVariants} from './searchVariants';

describe('searchVariants', function () {
    it('should search variants for russian', function () {
        expect(getSearchVariants('бор')).toEqual(['бор', 'бох']);
    });

    it('should search variants for translit', function () {
        expect(getSearchVariants('bor')).toEqual(['bor', 'бор', 'ищк']);
    });

    it('should search variants for wrong keyboard layout', function () {
        expect(getSearchVariants(',jh')).toEqual([',jh', ',jх', 'бор']);
    });

    it('should search variants for wrong reversed keyboard layout', function () {
        expect(getSearchVariants('ищк')).toEqual(['ищк', 'бор']);
    });
});