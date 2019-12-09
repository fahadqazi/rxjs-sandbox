import {fromEvent} from 'rxjs';
import {map, mergeMap, shareReplay, startWith} from "rxjs/operators";
import {fromPromise} from "rxjs/internal-compatibility";

const closeButton1 = fromEvent(document.querySelector('.close1'), 'click')
const closeButton2 = fromEvent(document.querySelector('.close2'), 'click')
const closeButton3 = fromEvent(document.querySelector('.close3'), 'click')


const refreshButton = document.querySelector('.refresh');
const refreshClickStream = fromEvent(refreshButton, 'click')

const requestStream$ = refreshClickStream.pipe(map(ev => {
    var random = Math.floor(Math.random() * 500)
    return 'https://api.github.com/users?since=' + random;
}), startWith('https://api.github.com/users?since=500'));

const responseStream$ = requestStream$.pipe(
    mergeMap(requestUrl => {
        console.log('request')
        return fromPromise(
            fetch(requestUrl)
                .then(resp => resp.json())
        )
    }),
    shareReplay(1)
);

function createSuggestionStream(responseStream: any) {
    return responseStream.pipe(
        map((listUser: any) => {
            return listUser[Math.floor(Math.random() * listUser.length)]
        })
    )
};

function renderSuggestion(userData: any, selector: any) {
    const element = document.querySelector(selector)
    const usernameElement = element.querySelector('.username')
    usernameElement.href = userData.html_url;
    usernameElement.textContent = userData.login;
    var imgEl = element.querySelector('img')
    imgEl.src = userData.avatar_url;
}

var suggestion1Stream = createSuggestionStream(responseStream$);
var suggestion2Stream = createSuggestionStream(responseStream$);
var suggestion3Stream = createSuggestionStream(responseStream$);

suggestion1Stream.subscribe((user: any) => {
    renderSuggestion(user, '.suggestion1')
});
suggestion2Stream.subscribe((user: any) => {
    renderSuggestion(user, '.suggestion2')
});
suggestion3Stream.subscribe((user: any) => {
    renderSuggestion(user, '.suggestion3')
});