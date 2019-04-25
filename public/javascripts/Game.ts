//////////////////////////////////////////////////////////////////////////////
class BinaryHeapStrategy<T> implements QueueStrategy<T> {

    private comparator: Comparator<T>;
    private data: T[];

    constructor(options: Options<T>) {
        this.comparator = options.comparator;
        this.data = options.initialValues ? options.initialValues.slice(0) : [];
        this._heapify();
    }

    private _heapify() {
        if (this.data.length > 0) {
            for (let i = 0; i < this.data.length; i++) {
                this._bubbleUp(i);
            }
        }
    }

    public queue(value: T) {
        this.data.push(value);
        this._bubbleUp(this.data.length - 1);
    }

    public dequeue(): T {
        const ret = this.data[0];
        const last = this.data.pop();
        if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this._bubbleDown(0);
        }
        return ret;
    }

    public peek(): T {
        return this.data[0];
    }

    public clear() {
        this.data.length = 0;
    }

    public _bubbleUp(pos: number) {
        while (pos > 0) {
            const parent = (pos - 1) >>> 1;
            if (this.comparator(this.data[pos], this.data[parent]) < 0) {
                const x = this.data[parent];
                this.data[parent] = this.data[pos];
                this.data[pos] = x;
                pos = parent;
            }
            else {
                break
            }
        }
    }

    public _bubbleDown(pos: number) {
        let last = this.data.length - 1;
        while (true) {
            const left = (pos << 1) + 1;
            const right = left + 1;
            let minIndex = pos;
            if (left <= last && this.comparator(this.data[left], this.data[minIndex]) < 0) {
                minIndex = left;
            }
            if (right <= last && this.comparator(this.data[right], this.data[minIndex]) < 0) {
                minIndex = right;
            }
            if (minIndex !== pos) {
                const x = this.data[minIndex];
                this.data[minIndex] = this.data[pos];
                this.data[pos] = x;
                pos = minIndex;
            }
            else {
                break;
            }
        }
        return void 0;
    }
}

type Comparator<T> = (a: T, b: T) => number;

interface Options<T> {
    comparator: Comparator<T>;
    initialValues?: T[];
}

interface QueueStrategy<T> {
    queue(value: T): void;
    dequeue(): T;
    peek(): T;
    clear(): void;
}

class PriorityQueue<T> {
    private _length: number = 0;
    public get length() { return this._length; }

    private strategy: QueueStrategy<T>;

    public constructor(options: Options<T>) {
        this._length = options.initialValues ? options.initialValues.length : 0;
        this.strategy = new BinaryHeapStrategy(options);
    }

    public queue(value: T) {
        this._length++;
        this.strategy.queue(value);
    }

    public dequeue() {
        if (!this._length) throw new Error("Empty queue");
        this._length--;
        return this.strategy.dequeue();
    }

    public peek() {
        if (!this._length) throw new Error("Empty queue");
        return this.strategy.peek();
    }

    public clear() {
        this._length = 0;
        this.strategy.clear();
    }
}
//////////////////////////////////////////////////////////////////////////////
let moves: number
let moveX = true
let aiMove = false
let gameOver = false
let firstMove = false
const btnX = "New Game X"
const btn0 = "New Game 0"
const MAX_PRIORITY = 6
const MIN_PRIORITY = 1

let Lines: string[][] = [
    ["a0", "a1", "a2"],
    ["b0", "b1", "b2"],
    ["c0", "c1", "c2"],
    ["a0", "b0", "c0"],
    ["a1", "b1", "c1"],
    ["a2", "b2", "c2"],
    ["a2", "b1", "c0"],
    ["c2", "b1", "a0"]
]

let WinsInThreee = new Array<Set<number>>(2);
let WinsInTwo = new Array<Set<number>>(2);
let WinsInOne = new Array<Set<number>>(2);
let cell2Line = new Map<string, number[]>();
let LineCells = new Array<Set<string>>(8);
let LineSet = new Array<Set<string>>(8);
let Cells: string[];

function initGame() {
    moves = 0;
    cell2Line.set("a0", [0, 3, 7]);
    cell2Line.set("a1", [0, 4]);
    cell2Line.set("a2", [0, 5, 6]);
    cell2Line.set("b0", [1, 3]);
    cell2Line.set("b1", [1, 4, 6, 7]);
    cell2Line.set("b2", [1, 5]);
    cell2Line.set("c0", [2, 3, 6]);
    cell2Line.set("c1", [2, 4]);
    cell2Line.set("c2", [2, 5, 7]);

    for (let i = 0; i < 2; i++) {
        WinsInThreee[i] = new Set<number>();
        WinsInTwo[i] = new Set<number>();
        WinsInOne[i] = new Set<number>();
    }
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 8; j++) {
            WinsInThreee[i].add(j);
        }
    }

    LineCells = new Array<Set<string>>(8);
    for (let i = 0; i < 8; i++) {
        LineCells[i] = new Set<string>();
        LineSet[i] = new Set(Lines[i]);
    }

    Cells = ["a0", "a1", "a2", "b0", "b1", "b2", "c0", "c1", "c2"];
}

let pq = new PriorityQueue({ comparator: function (a: CellPriority, b: CellPriority) { return b.priority - a.priority; } });

class CellPriority {
    priority: number
    cellId: string

    constructor(p: number, id: string) {
        this.priority = p;
        this.cellId = id;
    }
}

function makeMove(doc, btn) {
    moves++;
    if (firstMove) {
        setStatus(doc, "")
        firstMove = false;
    }
    //btn.textContent
    //if (btn.textContent != "" || gameOver)
    //    return;
    let moveStr = ""

    // Add marked cell to the line sets.
    let cellId: string = btn.id
    Cells[Cell2Num(btn.id)] = "";
    let cellLines = cell2Line.get(cellId);
    for (let line of cellLines) {
        LineCells[line].add(cellId);
    }

    let lines: number[] = cell2Line.get(cellId);
    let winInThree: Set<number>;
    let winInTwo: Set<number>;
    let winInOne: Set<number>;
    let lossInThree: Set<number>;
    let lossInTwo: Set<number>;
    let lossInOne: Set<number>;

    if (moveX) {
        winInThree = WinsInThreee[0];
        winInTwo = WinsInTwo[0];
        winInOne = WinsInOne[0];
        lossInThree = WinsInThreee[1];
        lossInTwo = WinsInTwo[1];
        lossInOne = WinsInOne[1];
    } else {
        winInThree = WinsInThreee[1];
        winInTwo = WinsInTwo[1];
        winInOne = WinsInOne[1];
        lossInThree = WinsInThreee[0];
        lossInTwo = WinsInTwo[0];
        lossInOne = WinsInOne[0];
    }

    for (let l of lines) {
        if (winInThree.has(l)) {
            winInThree.delete(l);
            winInTwo.add(l);
        } else if (winInTwo.has(l)) {
            winInTwo.delete(l);
            winInOne.add(l);
        } else if (winInOne.has(l)) {
            gameOver = true;
        }
        if (lossInThree.has(l)) {
            lossInThree.delete(l);
        }
        if (lossInTwo.has(l)) {
            lossInTwo.delete(l);
        }
        if (lossInOne.has(l)) {
            lossInOne.delete(l);
        }
    }

    if (moveX) {
        moveStr = "X"
        moveX = false;
    }
    else {
        moveStr = "0"
        moveX = true;
    }
    btn.textContent = moveStr

    if (gameOver) {
        if (aiMove) {
            setStatus(doc, "Game Over. Artifitial Intelegence Won.");
        } else {
            setStatus(doc, "Game Over. You won.");
        }
    } else if (moves >= 9) {
        setStatus(doc, "GameOver. Tie.");
    }

    if (aiMove) {
        aiMove = false;
    } else {
        aiMove = true;
        computerMove(doc);
    }
}

function setStatus(doc, stat) {
    let status = doc.getElementById("status");
    status.textContent = stat
}

function num2Cell(num: number) {
    let id: string;
    let l: number = Math.floor(num / 3);
    let n: number = num % 3;
    switch (l) {
        case 0:
            id = "a" + n.toString();
            break;
        case 1:
            id = "b" + n.toString();
            break;
        case 2:
            id = "c" + n.toString();
    }

    return id;
}

function Cell2Num(id: string) {
    switch (id) {
        case "a0":
            return 0;
        case "a1":
            return 1;
        case "a2":
            return 2;
        case "b0":
            return 3;
        case "b1":
            return 4;
        case "b2":
            return 5;
        case "c0":
            return 6;
        case "c1":
            return 7;
        case "c2":
            return 0;
    }
}

function newGame(doc, btn) {
    initGame();

    let fields = doc.getElementsByClassName("btn btn-primary");
    let i;
    for (i = 0; i < fields.length; i++) {
        fields[i].textContent = "";
    }

    setStatus(doc, "")
    gameOver = false
    if (btn.textContent == btnX) {
        aiMove = false;
        moveX = true;
        firstMove = true;
        setStatus(doc, "Make a move.");
    } else {
        moveX = true;
        aiMove = true;
        if (aiMove) {
            let rndCell = doc.getElementById(num2Cell(Math.floor(Math.random() * 9)));
            makeMove(doc, rndCell)
        }
    }
}

function computerMove(doc) {
    let winInThree: Set<number>;
    let winInTwo: Set<number>;
    let winInOne: Set<number>;
    let lossInThree: Set<number>;
    let lossInTwo: Set<number>;
    let lossInOne: Set<number>;

    pq.clear();
    if (moveX) {
        winInThree = WinsInThreee[0];
        winInTwo = WinsInTwo[0];
        winInOne = WinsInOne[0];
        lossInThree = WinsInThreee[1];
        lossInTwo = WinsInTwo[1];
        lossInOne = WinsInOne[1];
    } else {
        winInThree = WinsInThreee[1];
        winInTwo = WinsInTwo[1];
        winInOne = WinsInOne[1];
        lossInThree = WinsInThreee[0];
        lossInTwo = WinsInTwo[0];
        lossInOne = WinsInOne[0];
    }

    // 1. If possible to move in one move, make that move.
    for (let line of winInOne) {
        let emptyCellSet = new Set<string>(
            [...LineSet[line]].filter(x => !LineCells[line].has(x)))
        pq.queue(new CellPriority(MAX_PRIORITY, emptyCellSet.values().next().value));
    }

    // 2. If possible to loose in one move, lock the cell.
    for (let line of lossInOne) {
        let emptyCellSet = new Set<string>(
            [...LineSet[line]].filter(x => !LineCells[line].has(x)))
        pq.queue(new CellPriority(MAX_PRIORITY, emptyCellSet.values().next().value));
    }

    // 3. If possible to connect two winning lines, connect.
    for (let line of winInTwo) {
        for (let other of winInTwo) {
            if (line == other)
                continue;

            let lineCells = LineSet[line];
            let otherCells = LineSet[other];
            let intersection = new Set(
                [...lineCells].filter(x => otherCells.has(x)));
            if (intersection.size > 0) {
                let id = intersection.values().next().value;
                if (Cells[Cell2Num(id)] != "") {
                    pq.queue(new CellPriority(MAX_PRIORITY - 1, intersection.values().next().value));
                }
            } else {
                pq.queue(new CellPriority(2, intersection.values().next().value));
            }
        }
    }

    // Last, move to any free cell.
    for (let i = 0; i < 9; i++) {
        if (Cells[i]) {
            pq.queue(new CellPriority(MIN_PRIORITY, Cells[i]));
        }
    }

    let c = pq.dequeue();
    let moveCell = doc.getElementById(c.cellId);
    makeMove(doc, moveCell)
}
