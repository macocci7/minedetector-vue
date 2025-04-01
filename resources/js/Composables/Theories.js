export const theories = [
    // Properties:
    // - name: theory name
    // - pattern: test pattern
    //      - 'h': hidden (or flagged) panel
    //      - 'o': opened panel (any count of mines)
    //      - 0-8: count of mines (opened panel)
    // - flags: whether set a flag
    //      - 0: no action
    //      - 1: set a flag
    {
        name: '121',
        pattern: [
            ['h', 'h', 'h'],
            [1, 2, 1],
            [0, 0, 0],
        ],
        flags: [
            [1, 0, 1],
            [0, 0, 0],
            [0, 0, 0],
        ],
    },
    {
        name: '232',
        pattern: [
            ['h', 'h', 'h', 'h', 'h'],
            ['o', 2, 3, 2, 'o'],
            [0, 0, 'h', 0, 0],
        ],
        flags: [
            [0, 1, 0, 1, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
        ],
    },
    {
        name: '323',
        pattern: [
            ['h', 'h', 'h', 'h', 'h'],
            ['o', 3, 2, 3, 'o'],
            [0, 0, 'h', 0, 0],
        ],
        flags: [
            [1, 0, 1, 0, 1],
            [0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0],
        ],
    },
    {
        name: '1221',
        pattern: [
            ['h', 'h', 'h', 'h'],
            [1, 2, 2, 1],
            [0, 0, 0, 0],
        ],
        flags: [
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
    },
];
