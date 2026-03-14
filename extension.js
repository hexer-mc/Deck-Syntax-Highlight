const vscode = require('vscode');

const HEXYCARDS_RULES = [
    {
        scope: 'keyword.control.metadata.deck',
        settings: { foreground: '#ff9900' }
    },
    {
        scope: 'string.unquoted.metadata-value.deck',
        settings: { foreground: '#808080' }
    },
    {
        scope: 'comment.line.number-sign.deck',
        settings: { foreground: '#4FC3F7' }
    },
    {
        scope: 'entity.name.question.deck',
        settings: { foreground: '#6CE36C' }
    },
    {
        scope: 'punctuation.separator.answer.deck',
        settings: { foreground: '#808080' }
    },
    {
        scope: 'punctuation.separator.choice.deck',
        settings: { foreground: '#808080' }
    },
    {
        scope: 'string.unquoted.answer.correct.deck',
        settings: { foreground: '#A8E6A3' }
    },
    {
        scope: 'string.unquoted.answer.wrong.deck',
        settings: { foreground: '#FFB3B3' }
    },
    {
        scope: 'string.unquoted.answer.deck',
        settings: { foreground: '#FFFFFF' }
    },
    {
        scope: 'invalid.illegal.unfinished-card.deck',
        settings: { foreground: '#ff4d4d' }
    }
];

async function applyHexyCardsColors() {
    const config = vscode.workspace.getConfiguration();
    const current = config.get('editor.tokenColorCustomizations') || {};
    const currentRules = Array.isArray(current.textMateRules) ? current.textMateRules : [];

    const scopesToReplace = new Set(
        HEXYCARDS_RULES.map(rule => Array.isArray(rule.scope) ? rule.scope.join('|') : rule.scope)
    );

    const filteredRules = currentRules.filter(rule => {
        const scope = rule.scope;
        const normalized = Array.isArray(scope) ? scope.join('|') : scope;
        return !scopesToReplace.has(normalized);
    });

    const updated = {
        ...current,
        textMateRules: [
            ...filteredRules,
            ...HEXYCARDS_RULES
        ]
    };

    await config.update(
        'editor.tokenColorCustomizations',
        updated,
        vscode.ConfigurationTarget.Global
    );

    vscode.window.showInformationMessage('Colori consigliati di HexyCards applicati con successo.');
}

async function askToApplyColorsOnce(context) {
    const alreadyAsked = context.globalState.get('hexycards.colorsPromptShown', false);

    if (alreadyAsked) {
        return;
    }

    const choice = await vscode.window.showInformationMessage(
        'Vuoi applicare i colori consigliati di HexyCards per i file .deck?',
        'Sì',
        'No'
    );

    await context.globalState.update('hexycards.colorsPromptShown', true);

    if (choice === 'Sì') {
        await applyHexyCardsColors();
    }
}

function registerHoverProvider(context) {
    const provider = vscode.languages.registerHoverProvider('deck', {
        provideHover(document, position) {
            const line = document.lineAt(position.line).text;
            const char = position.character;

            if (line.startsWith('@')) {
                const metaMatch = line.match(/^(@\w+:)/);
                if (metaMatch) {
                    const metaTag = metaMatch[1];
                    const start = line.indexOf(metaTag);
                    const end = start + metaTag.length;

                    if (char >= start && char <= end) {
                        return new vscode.Hover(`**Metadata**\n\nQuesto è un tag metadata di HexyCards, ad esempio ${metaTag}`);
                    }
                }
            }

            if (line.startsWith('#')) {
                return new vscode.Hover('**Commento**\n\nQuesta riga è un commento e non viene letta dal programma.');
            }

            const sepIndex = line.indexOf('::');
            if (sepIndex !== -1) {
                const questionStart = 0;
                const questionEnd = sepIndex;

                const separatorStart = sepIndex;
                const separatorEnd = sepIndex + 2;

                const answerPart = line.slice(separatorEnd);
                const answerAbsoluteStart = separatorEnd;

                if (char >= questionStart && char < questionEnd) {
                    return new vscode.Hover('**Domanda**\n\nQuesta è la domanda della flashcard.');
                }

                if (char >= separatorStart && char < separatorEnd) {
                    return new vscode.Hover('**Separatore**\n\n`::` separa la domanda dalla risposta.');
                }

                if (char >= answerAbsoluteStart) {
                    const parts = answerPart.split('||');

                    if (parts.length === 1) {
                        return new vscode.Hover('**Risposta**\n\nQuesta è la risposta della flashcard.');
                    }

                    let currentOffset = 0;

                    for (let i = 0; i < parts.length; i++) {
                        const rawPart = parts[i];
                        const trimmedLeft = rawPart.length - rawPart.trimStart().length;
                        const trimmedRight = rawPart.length - rawPart.trimEnd().length;

                        const blockStart = answerAbsoluteStart + currentOffset + trimmedLeft;
                        const blockEnd = answerAbsoluteStart + currentOffset + rawPart.length - trimmedRight;

                        if (char >= blockStart && char <= blockEnd) {
                            if (i === 0) {
                                return new vscode.Hover('**Risposta corretta**\n\nQuesta è l’opzione corretta della domanda a scelta multipla.');
                            } else {
                                return new vscode.Hover('**Risposta errata**\n\nQuesta è un’opzione errata della domanda a scelta multipla.');
                            }
                        }

                        currentOffset += rawPart.length;

                        if (i < parts.length - 1) {
                            const sepStart = answerAbsoluteStart + currentOffset;
                            const sepEnd = sepStart + 2;

                            if (char >= sepStart && char < sepEnd) {
                                return new vscode.Hover('**Separatore opzioni**\n\n`||` separa le opzioni della domanda a scelta multipla.');
                            }

                            currentOffset += 2;
                        }
                    }

                    return new vscode.Hover('**Risposta**\n\nQuesta è la sezione risposta della flashcard.');
                }
            }

            if (!line.startsWith('@') && !line.startsWith('#') && line.trim() !== '') {
                return new vscode.Hover('**Riga incompleta**\n\nQuesta riga non è ancora valida: manca `::` per separare domanda e risposta.');
            }

            return null;
        }
    });

    context.subscriptions.push(provider);
}

function activate(context) {
    registerHoverProvider(context);

    const applyColorsCommand = vscode.commands.registerCommand('hexycards.applyColors', async () => {
        await applyHexyCardsColors();
    });

    context.subscriptions.push(applyColorsCommand);

    askToApplyColorsOnce(context);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};