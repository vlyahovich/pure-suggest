import {PureSuggest} from "../extension/extension";
import {UsersSuggestSource} from './UsersSuggestSource';

document.addEventListener('DOMContentLoaded', function () {
    new PureSuggest(document.querySelector('.suggest_default'), {
        initialData: window.__initialData,
        createSource: (data) => new UsersSuggestSource(data)
    });

    new PureSuggest(document.querySelector('.suggest_text'), {
        initialData: window.__initialData,
        createSource: (data) => new UsersSuggestSource(data),
        hideAvatar: true
    });

    new PureSuggest(document.querySelector('.suggest_multi'), {
        initialData: window.__initialData,
        createSource: (data) => new UsersSuggestSource(data),
        multi: true
    });
});