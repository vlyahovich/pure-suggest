import {PureSuggest} from "../extension/extension";
import {UsersSuggestSource} from './UsersSuggestSource';

document.addEventListener('DOMContentLoaded', function () {
    new PureSuggest(document.querySelector('.suggest_default'), {
        initialData: (window as any).__initialData,
        createSource: (data) => new UsersSuggestSource(data)
    });

    new PureSuggest(document.querySelector('.suggest_text'), {
        initialData: (window as any).__initialData,
        createSource: (data) => new UsersSuggestSource(data),
        hideAvatar: true
    });

    new PureSuggest(document.querySelector('.suggest_multi'), {
        initialData: (window as any).__initialData,
        createSource: (data) => new UsersSuggestSource(data),
        multi: true
    });
});