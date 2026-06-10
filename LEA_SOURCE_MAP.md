# LEA Source Map

This file explains which LEA folders inside `vv-nexus` are canonical, mirrored, or divergent.

## Current Structure

LEA-related files currently appear in three places inside this repository:

- repository root
- `lea/`
- `VV LEA STUDIOS/`

## Canonical Status

### 1. Repository root

The repository root should be treated as the canonical source for the current LEA web surface inside `vv-nexus`.

Key files verified here include:

- `lea-home.html`
- `lea-motor.js`
- `lea-profile.js`
- `lea-shelves.js`
- `lea-speech.js`
- `lea-state.js`
- `lea-intention.js`
- `lea-dictionary.js`
- `lea-diacritice.js`
- `lea-correct.js`
- `alexandria-data-v2.js`

### 2. `lea/`

The `lea/` folder is currently a mirror of the root for the verified LEA files above.

Verification result:

- all checked files matched the root exactly by file hash

Current practical meaning:

- useful as a mirrored copy
- not a separate source of truth

### 3. `VV LEA STUDIOS/`

`VV LEA STUDIOS/` is not fully synchronized with the root.

Observed state:

- some files match the root
- some files are missing entirely
- some files differ from the root

Examples:

- `lea-home.html` matches
- `lea-motor.js` differs
- `lea-dictionary.js` is missing
- `alexandria-data-v2.js` is missing

Current practical meaning:

- treat this folder as a separate branch, studio variant, or legacy partial copy
- do not treat it as the canonical LEA source

## Working Rule

When updating the current LEA web implementation inside `vv-nexus`:

1. edit the repository root first
2. treat `lea/` as mirrored structure
3. do not assume `VV LEA STUDIOS/` stays in sync unless it is updated deliberately

## Summary

- canonical source: repository root
- mirrored copy: `lea/`
- divergent variant: `VV LEA STUDIOS/`
