<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useCookies } from "vue3-cookies";
import { autoplay } from "@/Composables/Autoplay.js";

const WIDTH_MIN = 5;
const WIDTH_MAX = 30;
const WIDTH_DEFAULT = 15;
const HEIGHT_MIN = 5;
const HEIGHT_MAX = 30;
const HEIGHT_DEFAULT = 10;
const MINES_COUNT_DEFAULT = parseInt(WIDTH_DEFAULT * HEIGHT_DEFAULT * 0.2, 10);
const COOKIE_NAME_HIGHSCORES = "highscores";
const HIGHSCORE_RANKERS_COUNT = 3;

const fieldWidthInput = ref(WIDTH_DEFAULT);
const fieldHeightInput = ref(HEIGHT_DEFAULT);
const minesCountInput = ref(MINES_COUNT_DEFAULT);
const fieldWidth = ref(fieldWidthInput.value);
const fieldHeight = ref(fieldHeightInput.value);
const minesCount = ref(minesCountInput.value);
const mines = ref([]);
const panels = ref([]);
const remain = ref(minesCount.value);
const isStarted = ref(false);
const isPaused = ref(false);
const isGameOver = ref(false);
const isCleared = ref(false);
const STR_FLAG = ref('🚩');
const STR_BOMB = ref('💣');
var intervalID = ref();
var time = ref(0);
const { cookies } = useCookies();
const highScores = ref({});
const highScoreRankersCount = ref(HIGHSCORE_RANKERS_COUNT);
const isVisibleNewHighScoreForm = ref(false);
const rankerName = ref('');

const statMessage = computed(() => {
    return !isStarted.value && !isGameOver.value
        ? 'READY'
        : (isStarted.value && !isGameOver.value
            ? 'In Game'
            : (isPaused.value
                ? 'Game Paused'
                : (isCleared.value
                    ? 'Cleared! Congratulations!'
                    : (isGameOver.value ? 'Game Over' : '')
                )
            )
        )
});

const highScoresText = computed(() => {
    let hsTexts = [];
    let className = getHighScoreClassName();
    for (let i = 1; i <= highScoreRankersCount.value; i++) {
        if (i in highScores.value[className]) {
            let hsName = highScores.value[className][i].name;
            let hsTime = highScores.value[className][i].time;
            hsTexts.push(i + ': ' + ((typeof hsTime === "undefined")
                ? '---'
                : (
                    (typeof hsName === "undefined")
                    ? "nobody " + hsTime.toFixed(2) + "sec."
                    : hsName + " " + hsTime.toFixed(2) + "sec."
                )));
        } else {
            hsTexts.push(i + ': ' + '---');
        }   
    }
    return hsTexts.join(' / ');
});

// Initialization
function init() {
    checkInputValues();
    fieldWidth.value = parseInt(fieldWidthInput.value, 10);
    fieldHeight.value = parseInt(fieldHeightInput.value, 10);
    minesCount.value = parseInt(minesCountInput.value, 10);
    remain.value = fieldWidth.value * fieldHeight.value;
    isStarted.value = false;
    isPaused.value = false;
    isGameOver.value = false;
    isCleared.value = false;
    time.value = 0;
    for (let y = 0; y <= fieldHeight.value + 1; y++) {
        mines.value[y] = [];
        panels.value[y] = [];
        for (let x = 0; x <= fieldWidth.value + 1; x++) {
            mines.value[y][x] = 0;
            panels.value[y][x] = 0;
        }
    }
    loadHighScores();
    setMines();
    countMinesAround();
}

function checkInputValues() {
    let width = parseInt(fieldWidthInput.value, 10);
    let height = parseInt(fieldHeightInput.value, 10);
    let count = parseInt(minesCountInput.value, 10);
    if (isNaN(width)) {
        fieldWidthInput.value = WIDTH_DEFAULT;
        width = WIDTH_DEFAULT;
    }
    if (isNaN(height)) {
        fieldHeightInput.value = HEIGHT_DEFAULT;
        height = HEIGHT_DEFAULT;
    }
    if (isNaN(count)) {
        minesCountInput.value = MINES_COUNT_DEFAULT;
        count = MINES_COUNT_DEFAULT;
    }
    if (width < WIDTH_MIN) {
        fieldWidthInput.value = WIDTH_MIN;
        width = WIDTH_MIN;
    }
    if (width > WIDTH_MAX) {
        fieldWidthInput.value = WIDTH_MAX;
        width = WIDTH_MAX;
    }
    if (height < HEIGHT_MIN) {
        fieldHeightInput.value = HEIGHT_MIN;
        height = HEIGHT_MIN;
    }
    if (height > HEIGHT_MAX) {
        fieldHeightInput.value = HEIGHT_MAX;
        height = HEIGHT_MAX;
    }
    if (count < 1) {
        minesCountInput.value = 1;
    }
    if (count > width * height) {
        minesCountInput.value = width * height;
    }
}

// Set mines
function setMines() {
    for (let n = 1; n <= minesCount.value; n++) {
        while (1) {
            let x = Math.floor( Math.random() * fieldWidth.value ) + 1;
            let y = Math.floor( Math.random() * fieldHeight.value ) + 1;
            if (mines.value[y][x] === -1) {
                continue;
            }
            mines.value[y][x] = -1;
            break;
        }
    }
}

// Count mines around
function countMinesAround() {
    for (let y = 1; y <= fieldHeight.value; y++) {
        for (let x = 1; x <= fieldWidth.value; x++) {
            if (mines.value[y][x] !== -1) {
                mines.value[y][x] = (mines.value[y - 1][x - 1] === -1 ? 1 : 0)
                                  + (mines.value[y - 1][x    ] === -1 ? 1 : 0)
                                  + (mines.value[y - 1][x + 1] === -1 ? 1 : 0)
                                  + (mines.value[y    ][x - 1] === -1 ? 1 : 0)
                                  + (mines.value[y    ][x + 1] === -1 ? 1 : 0)
                                  + (mines.value[y + 1][x - 1] === -1 ? 1 : 0)
                                  + (mines.value[y + 1][x    ] === -1 ? 1 : 0)
                                  + (mines.value[y + 1][x + 1] === -1 ? 1 : 0);
              }
        }
    }
}

function revealAPanel(x, y) {
    if (isGameOver.value) {
        return;
    }
    if (!isStarted.value) {
        startGame();
    }
    if (isPaused.value) {
        restartGame();
    }
    if (!isRevealable(x, y)) {
        return;
    }
    isStarted.value = true;
    if (isMine(x, y)) {
        return gameOver(x, y);
    }
    remain.value--;
    panels.value[y][x] = 1;
    if (remain.value == minesCount.value) {
        clearGame();
    }
    if (mines.value[y][x] == 0) {
        revealAround(x, y);
    }
}

function revealAround(x, y) {
    for (let j = -1; j <= 1; j++) {
        let ty = y + j;
        for (let i = -1; i <= 1; i++) {
            let tx = x + i;
            if (!isInRange(tx, ty)) {
                continue;
            }
            if (isRevealable(tx, ty)) {
                revealAPanel(tx, ty);
            }
        }
    }
}

function setAFlag(x, y) {
    if (isGameOver.value) {
        return;
    }
    if (!isStarted.value) {
        startGame();
    }
    if (isPaused.value) {
        restartGame();
    }
    if (panels.value[y][x] == 1) {
        return;
    }
    if (panels.value[y][x] == -1) {
        panels.value[y][x] = 0;
        return;
    }
    panels.value[y][x] = -1;
}

function setFlagsOnAllMines() {
    for (let y = 1; y <= fieldHeight.value; y++) {
        for (let x = 1; x <= fieldWidth.value; x++) {
            if (mines.value[y][x] == -1) {
                panels.value[y][x] = -1;
            }
        }
    }
}

function isRevealable(x, y) {
    if (isGameOver.value) {
        return false;
    }
    if (panels.value[y][x] == 0) {
        return true;
    }
    return false;
}

function isMine(x, y) {
    return mines.value[y][x] == -1;
}

function isInRange(x, y) {
    return x >= 1
        && x <= fieldWidth.value
        && y >= 1
        && y <= fieldHeight.value;
}

function startGame() {
    isStarted.value = true;
    startTimer();
}

function pauseGame() {
    isPaused.value = true;
    clearInterval(intervalID.value);
}

function restartGame() {
    isPaused.value = false;
    startTimer();
}

function resetGame() {
    endGame();
    init();
}

function clearGame() {
    isCleared.value = true;
    endGame();
    setFlagsOnAllMines();
    if (isHighScore()) {
        alert("You've got a new record!");
        isVisibleNewHighScoreForm.value = true;
    } else {
        alert("You win!");
    }
}

function endGame() {
    isStarted.value = false;
    isGameOver.value = true;
    clearInterval(intervalID.value);
}

function gameOver(x, y) {
    endGame();
    showAllMines();
    panels.value[y][x] = 2;
}

function showAllMines() {
    for (let y = 1; y <= fieldHeight.value; y++) {
        for (let x = 1; x <= fieldWidth.value; x++) {
            if (mines.value[y][x] == -1) {
                panels.value[y][x] = 1;
            }
        }
    }
}

function startTimer() {
    intervalID.value = setInterval(
        () => {
            time.value += 0.01;
        },
        10
    );
}

function loadHighScores() {
    let hs = cookies.get(COOKIE_NAME_HIGHSCORES);
    let className = getHighScoreClassName();
    highScores.value = (typeof hs === "undefined" || hs === null) ? {} : hs;
    if (!highScores.value.hasOwnProperty(className)) {
        highScores.value[className] = {};
    }
}

function clearHighScores() {
    let className = getHighScoreClassName();
    highScores.value[className] = {};
    saveHighScores();
}

function isHighScore() {
    let className = getHighScoreClassName();
    if (!highScores.value.hasOwnProperty(className)) {
        return true;
    }
    for (let i = 1; i <= highScoreRankersCount.value; i++) {
        if (!highScores.value[className].hasOwnProperty(i)) {
            return true;
        }
        if (time.value < highScores.value[className][i].time) {
            return true;
        }
    }
    return false;
}

function getHighScoreClassName() {
    return "w" + fieldWidth.value.toString() + "h" + fieldHeight.value.toString();
}

function registerNewHighScore() {
    let className = getHighScoreClassName();
    for (let i = 1; i <= highScoreRankersCount.value; i++) {
        if (!highScores.value[className].hasOwnProperty(i)) {
            highScores.value[className][i] = {
                name: rankerName.value,
                time: time.value,
            };
            break;
        }
        if (highScores.value[className][i].time > time.value) {
            swapHighScoreRankers(i);
            highScores.value[className][i] = {
                name: rankerName.value,
                time: time.value,
            };
            break;
        }
    }
    saveHighScores();
    isVisibleNewHighScoreForm.value = false;
}

function swapHighScoreRankers(s) {
    let className = getHighScoreClassName();
    for (let i = highScoreRankersCount.value; i > s; i--) {
        if (highScores.value[className].hasOwnProperty(i - 1)) {
            highScores.value[className][i] = {
                name: highScores.value[className][i - 1].name + '',
                time: highScores.value[className][i - 1].time + 0,
            };
        }
    }
}

function closeNewHighScoreForm() {
    isVisibleNewHighScoreForm.value = false;
}

function saveHighScores() {
    cookies.set(COOKIE_NAME_HIGHSCORES, highScores.value);
}

init();

onBeforeUnmount(() => clearInterval(intervalID.value));
</script>

<template>
    <div id="mine-detector">
        <div>
            Width: <input
                id="fieldWidthInput"
                v-model="fieldWidthInput"
                size="2"
                class="border border-gray-400 rounded-md"
            />
            / Height: <input
                id="fieldHeightInput"
                v-model="fieldHeightInput"
                size="2"
                class="border border-gray-400 rounded-md"
            />
            / Mines: <input
                id="minesCountInput"
                v-model="minesCountInput"
                size="2"
                class="border border-gray-400 rounded-md"
            />
            / Remain: <span id="remain">{{ remain }}</span>
            / Time: {{ time.toFixed(2) }} sec.
        </div>
        <div>
            High Scores: {{ highScoresText }}
            <button
                class="m-2 py-1 px-2 rounded-sm bg-red-500 text-white font-bold hover:bg-red-400 hover:text-yellow-200"
                @click="clearHighScores"
            >
                CLEAR
            </button>
        </div>
        <div
            id="new-highscore-form"
            class="modal"
            v-show="isVisibleNewHighScoreForm"
        >
            <div
                class="modal-content"
            >
                <button
                    class="modal-close"
                    @click="closeNewHighScoreForm"
                >
                    &times;
                </button>
                <label>NAME:</label>
                <input
                    type="text"
                    v-model="rankerName"
                    placeholder="Input your name."
                    class="m-2 p-1 border border-gray-400 rounded-sm bg-yellow-100"
                >
                <button
                    class="m-2 py-1 px-2 rounded-sm bg-green-500 text-white font-bold hover:bg-green-400 hover:text-yellow-200"
                    @click="registerNewHighScore"
                >
                    REGISTER
                </button>
            </div>
        </div>
        <div>
            {{ statMessage }}
        </div>
        <div>
            <button
                class="m-2 py-1 px-2 rounded-sm bg-green-500 text-white font-bold hover:bg-green-400 hover:text-yellow-200"
                @click="resetGame"
            >
                RESET
            </button>
            <button
                v-if="isStarted && !isPaused"
                class="m-2 py-1 px-2 rounded-sm bg-green-500 text-white font-bold hover:bg-green-400 hover:text-yellow-200"
                @click="pauseGame"
            >
                PAUSE
            </button>
            <button
                v-if="isPaused"
                class="m-2 py-1 px-2 rounded-sm bg-green-500 text-white font-bold hover:bg-green-400 hover:text-yellow-200"
                @click="restartGame"
            >
                RESTART
            </button>
            <button
                v-if="!isGameOver"
                id="autoplay-button"
                class="m-2 py-1 px-2 rounded-sm bg-green-500 text-white font-bold hover:bg-green-400 hover:text-yellow-200"
                @click="autoplay"
            >
                AUTOPLAY
            </button>
        </div>
        <table id="mine-detector-panels" class="border-collapse">
            <tr
                v-for="y in fieldHeight"
            >
                <td
                    v-for="x in fieldWidth"
                    :x="x"
                    :y="y"
                    class="border border-black bg-gray-200 hover:bg-gray-400 text-center table-fixed whitespace-nowrap overflow-hidden overflow-ellipsis"
                    :class="{
                        'hide': panels[y][x] === 0,
                        'red': panels[y][x] === 2,
                        'flag': panels[y][x] === -1,
                        'opened': panels[y][x] === 1,
                    }"
                    style="width: 24px; height: 24px;"
                    :v="mines[y][x]"
                    @click.left="revealAPanel(x, y)"
                    @click.right.prevent="setAFlag(x, y)"   
                >
                    {{
                        panels[y][x] == 0
                            ? ''
                            : (panels[y][x] == -1
                                ? STR_FLAG
                                : (mines[y][x] == -1
                                    ? STR_BOMB
                                    : (mines[y][x] > 0 ? mines[y][x] : '')
                                )
                            )
                    }}
                </td>   
            </tr>
        </table>
    </div>
</template>

<style>
#mine-detector {
    user-select: none;
}
td[v="-1"] { color:#000000; font-weight: bold; }
td[v="1"] { color:#0000ff; font-weight: bold; }
td[v="2"] { color:#009900; font-weight: bold; }
td[v="3"] { color:#ff0000; font-weight: bold; }
td[v="4"] { color:#000099; font-weight: bold; }
td[v="5"] { color:#990000; font-weight: bold; }
td[v="6"] { color:#0099ff; font-weight: bold; }
td[v="7"] { color:#333333; font-weight: bold; }
td[v="8"] { color:#663333; font-weight: bold; }
td.hide {
    background-color: #cccccc;
    box-shadow: 2px 2px rgba(248,248,248,1) inset;
    box-shadow: -2px -2px rgba(64,64,64,1) inset;
}
td.hide:active {
    background-color: #cccccc;
    box-shadow: 2px 2px rgba(64,64,64,1) inset;
    box-shadow: -2px -2px rgba(248,248,248,1) inset;
}
td.red { background-color: #ff0000; }
td.flag {
    padding: 0px;
    color: #ff0000;
    background-color: #ffcc00;
}
.modal {
    display: flex;
    position: fixed;
    z-index: 9999;
    top: 0; right: 0; bottom: 0; left: 0;
    width: 100vw;
    height: 100%;
    flex-direction: column; /* 追加 */
    overflow: hidden scroll;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    position: relative;
    background-color: #fefefe;
    margin: 10% auto;
    padding: 20px;
    padding-top: 10px;
    border: 1px solid #888;
    border-radius: 10px;
    width: 80%;
}

.modal-close {
    position: absolute;
    right: 10px;
    top: -8px;
    color: #888;
    font-size: 32px;
    cursor: pointer;
}

.modal-close:hover,
.modal-close:focus {
    color: #000;
    text-decoration: none;
    cursor: pointer;
}
</style>
