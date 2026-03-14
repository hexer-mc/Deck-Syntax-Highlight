<p align="center">
<img src="icon.png" width="96" height="96">
</p>

<h1 align="center">
Deck Syntax Highlight
</h1>

<p align="center">
VS Code extension that adds syntax highlighting and editing support for <code>.deck</code> flashcard files used by the
<b>HexyCards</b> project.
</p>

## Features

This extension provides a development experience for
**HexyCards `.deck` files**:

-   Syntax highlighting for:
    -   metadata (`@title`, `@lang`, `@author`)
    -   comments
    -   questions
    -   answers
    -   multiple choice answers
-   Visual differentiation between:
    -   correct answers
    -   wrong answers
-   Detection of incomplete flashcards
-   Hover explanations for deck elements

## ⚠️ Recommended Setup

When the extension activates for the first time, a popup will appear
asking:

    Do you want to apply the recommended HexyCards colors?

**It is strongly recommended to click `Yes`.**

This will apply the color configuration required for the full HexyCards
editing experience.

✔ The configuration only affects the custom scopes used by `.deck`
files
✔ It **does not modify the appearance of other languages**

Other file types like `.js`, `.php`, `.py`, `.json`, etc. remain
unchanged.

------------------------------------------------------------------------

## Syntax Highlighting

The extension highlights `.deck` files using the following logic:

  Element                                   Color
  ----------------------------------------- --------------------
  Metadata (`@title`, `@lang`, `@author`)   Orange
  Metadata value                            Gray
  Comments                                  Cyan
  Question                                  Green
  `::` separator                            Gray
  Correct answer                            Light pastel green
  Wrong answers                             Light pastel red
  Incomplete card                           Red

------------------------------------------------------------------------

## Changing the Colors

If you want to customize the colors, you can modify your **VS Code
settings**.

Open:

    Preferences → Open Settings (JSON)

Then edit the section:

``` json
editor.tokenColorCustomizations
```

Example:

``` json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "entity.name.question.deck",
        "settings": {
          "foreground": "#6CE36C"
        }
      }
    ]
  }
}
```

All HexyCards scopes end with `.deck`, so they only affect `.deck`
files.

------------------------------------------------------------------------

## Building the Extension

To build the extension locally:

### 1 Install the VS Code extension tool

    npm install -g @vscode/vsce

### 2 Package the extension

Inside the project folder run:

    vsce package

This will generate a file like:

    hexycards-deck-0.0.x.vsix

### 3 Install the extension

In VS Code:

    Ctrl + Shift + P

Run:

    Extensions: Install from VSIX

Then select the generated `.vsix` file.
