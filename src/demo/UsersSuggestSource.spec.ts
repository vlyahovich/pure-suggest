import {UsersSuggestSource} from './UsersSuggestSource';

const INITIAL_DATA = [
    [
        '103',
        'Борис Дмитриев',
        'Шарапова, Дорофеева and Евсеева',
        'https://s3.amazonaws.com/uifaces/faces/twitter/nicklacke/128.jpg',
        'boris-dmitriev'
    ],
    [
        '159',
        'Кира Борисова',
        'Павлов - Сорокин',
        'https://s3.amazonaws.com/uifaces/faces/twitter/romanbulah/128.jpg',
        'kira-borisova'
    ]
];

class TestUsersSuggestSource extends UsersSuggestSource {
    fetch(_term: string) {
        return Promise.resolve([
            [
                '1',
                'Борис Лихачев',
                'Шарапов - Пахомов',
                'https://s3.amazonaws.com/uifaces/faces/twitter/areus/128.jpg',
                'boris-lihachev'
            ],
            [
                '78',
                'Борис Осипов',
                'Игнатьев Сбыт',
                'https://s3.amazonaws.com/uifaces/faces/twitter/jayrobinson/128.jpg',
                'boris-osipov'
            ]
        ])
    }
}

describe('UsersSuggestSource', function () {
    let source: TestUsersSuggestSource;

    beforeEach(function () {
        source = new TestUsersSuggestSource(INITIAL_DATA);
    });

    it('should serialize', function () {
        expect(source.serialize([[
            '1',
            'Борис Лихачев',
            'Шарапов - Пахомов',
            'https://s3.amazonaws.com/uifaces/faces/twitter/areus/128.jpg',
            'boris-lihachev'
        ]])).toEqual([{
            id: '1',
            title: 'Борис Лихачев',
            subtitle: 'Шарапов - Пахомов',
            image: 'https://s3.amazonaws.com/uifaces/faces/twitter/areus/128.jpg'
        }]);
    });

    it('should search data', function (done) {
        source.search('бо', []).then((items) => {
            expect(items.map(({id}) => id)).toEqual(['103', '159', '1', '78']);

            done();
        });
    });

    it('should search data excluding values', function (done) {
        source
            .search('бо', [{
                id: '1',
                title: 'Борис Лихачев',
                subtitle: 'Шарапов - Пахомов',
                image: 'https://s3.amazonaws.com/uifaces/faces/twitter/areus/128.jpg'
            }])
            .then((items) => {
                expect(items.map(({id}) => id)).toEqual(['103', '159', '78']);

                done();
            });
    });

    it('should highlight', function () {
        expect(source.highlight('Борис Лихачев', 'бо')).toEqual(['', 'Бо', 'рис Лихачев']);
        expect(source.highlight('Борис Лихачев', 'ли')).toEqual(['Борис ', 'Ли', 'хачев']);
    });
});