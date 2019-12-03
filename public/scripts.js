'use strict';

function escapeHtml(text){
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.select-rating').forEach(parent => {
        const fullStar = '●';
        const halfStar = '◐';
        const zeroStar = '○';

        const inputEl = parent.querySelector('input[type=hidden]');

        let state = [zeroStar, zeroStar, zeroStar, zeroStar, zeroStar];

        function commitState(starElement) {
            state[parseInt(starElement.getAttribute('data-index'))] = starElement.innerText;
            if (starElement.innerText == fullStar)
                return 1;
            else if (starElement.innerText == halfStar)
                return 0.5;
            else
                return 0;
        }

        function restoreState() {
            state.forEach((text, index) => {
                parent.querySelector(`.rating[data-index="${index}"]`).innerText = text
            });
        }

        if (inputEl.value && inputEl.value.length && inputEl.value !== '0') {
            let intVal = parseInt(inputEl.value);
            let floatVal = parseFloat(inputEl.value);
            for (let i = 0; i < intVal; i++) state[i] = fullStar;
            if (Math.abs((floatVal - intVal) - 0.5) < 0.001) {
                state[intVal] = halfStar;
            }
            parent.classList.add('selected');
            restoreState();
        }

        parent.addEventListener('mouseout', event => {
            if (parent.classList.contains('disabled')) return;
            if (inputEl.value && inputEl.value.length && inputEl.value !== '0')
                parent.classList.add('selected');
            restoreState();
        });
        parent.addEventListener('mouseover', event => {
            if (parent.classList.contains('disabled')) return;
            parent.classList.remove('selected');
            restoreState();
        });

        parent.querySelectorAll('.rating').forEach(starEl => {
            starEl.addEventListener('mousemove', event => {
                if (parent.classList.contains('disabled')) return;

                let x = event.pageX - starEl.getBoundingClientRect().x;
                let halfWidth = starEl.getBoundingClientRect().width / 2;
                let myIndex = parseInt(starEl.getAttribute('data-index'));

                starEl.innerText = x < halfWidth ? halfStar : fullStar;

                parent.querySelectorAll('.rating').forEach(other => {
                    let otherIndex = parseInt(other.getAttribute('data-index'));
                    if (otherIndex < myIndex) {
                        other.innerText = fullStar;
                    } else if (otherIndex > myIndex) {
                        other.innerText = zeroStar;
                    }
                });
            });
            starEl.addEventListener('click', event => {
                if (parent.classList.contains('disabled')) return;

                let score = 0;
                parent.querySelectorAll('.rating').forEach(starEl => score += commitState(starEl));
                console.log(state);
                inputEl.value = score;
            })
            starEl.addEventListener('mouseout', event => {
                if (parent.classList.contains('disabled')) return;

                starEl.innerText = zeroStar;
            })
        });
    });

    document.querySelectorAll('.castMemberSearchBox').forEach(castMemberSearchBox => {
        const castMemberSearchInput = castMemberSearchBox.querySelector('.castMemberSearchInput');
        const castMemberSearchLoadingIcon = castMemberSearchBox.querySelector('.castMemberSearchLoadingIcon');
        const castMemberSearchResults = castMemberSearchBox.querySelector('.castMemberSearchResults');
        const castMemberSelectedValues = castMemberSearchBox.querySelector('.castMemberSelectedValues');
        let castMemberSearchTimeout = null;

        const hideElement = (el) => el.style.display = "none";
        const showElement = (el) => el.style.display = "";

        castMemberSelectedValues.querySelectorAll('.castMember').forEach(el => {
            el.querySelector('button').addEventListener('click', () => {
                castMemberSelectedValues.removeChild(el);
            });
        });

        castMemberSearchInput.addEventListener('input', function(event) {
            hideElement(castMemberSearchLoadingIcon);
            clearTimeout(castMemberSearchTimeout);

            let searchText = castMemberSearchInput.value.trim();
            if (!searchText)  {
                hideElement(castMemberSearchResults);
                return;
            }

            let firstName = searchText.split(' ')[0];
            let lastName = searchText.split(' ').slice(1).join(' ');

            showElement(castMemberSearchLoadingIcon);
            castMemberSearchTimeout = setTimeout(function() {
                axios.get('/forms/getCastMembers', {
                    params: { firstName: firstName, lastName: lastName }
                }).then(response => {
                    hideElement(castMemberSearchLoadingIcon);

                    let alreadySelectedCastMemberIds =
                        Array.from(castMemberSelectedValues.querySelectorAll('.castMember'))
                        .map(el => parseInt(el.getAttribute('data-id')));

                    console.log(alreadySelectedCastMemberIds);

                    let html = '';
                    response.data.forEach(castMember => {
                        let id = castMember.cast_member_id;
                        let name = escapeHtml(castMember.first_name+' '+castMember.last_name);
                        let birthDate = new Date(castMember.birth_date).toISOString().slice(0,10);

                        if (alreadySelectedCastMemberIds.includes(id)) {
                            return;
                        }

                        html += `<div class="castMember" data-id="${id}" data-name="${name}" data-birthdate="${birthDate}">
                            <span class="name">${name}</span>
                            <span class="birthDate">${birthDate}</span>
                        </div>`;
                    });

                    if (!html.length) {
                        html = '<div style="font-size:0.85em;padding:5px">No results.</div>';
                    } else {
                        html = '<div style="max-height:400px;overflow-y:scroll;margin-top:1px">' + html + '</div>';
                    }

                    castMemberSearchResults.innerHTML = html + '<hr><button type="button">close</button>';
                    showElement(castMemberSearchResults);

                    castMemberSearchResults.querySelector('button').addEventListener('click', () => {
                        castMemberSearchInput.value = '';
                        hideElement(castMemberSearchResults);
                    });

                    castMemberSearchResults.querySelectorAll('.castMember').forEach(el => {
                        el.addEventListener('click', () => {
                            castMemberSearchInput.value = '';
                            hideElement(castMemberSearchResults);

                            let newEl = el.cloneNode(true);
                            newEl.innerHTML = newEl.innerHTML +
                                `<input name="castMember" type="hidden" value="${newEl.getAttribute('data-id')}">
                                <button type="button">x</button>`;
                            newEl.querySelector('button').addEventListener('click', () => {
                                castMemberSelectedValues.removeChild(newEl);
                            });
                            castMemberSelectedValues.appendChild(newEl);
                        });
                    })
                }).catch(error => {
                    console.error(error);

                    castMemberSearchInput.value = '';
                    castMemberSearchResults.innerHTML = 'An error occurred.';
                    hideElement(castMemberSearchLoadingIcon);
                    showElement(castMemberSearchResults);
                });
            }, 250);
        });
    });
});