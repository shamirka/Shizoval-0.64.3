import { consoleLog, utils } from '../../index.js';

const __filename = 'src/Game/features/consoleLog.js';

export default class ConsoleLog {
    #initialized = false;

    reset = () => {
        this.#initialized = false;
    }

    getClanTag = clanTag => {
        return clanTag === null ? '' : `[${clanTag}] `;
    }

    getName = labelData => {
        return `${this.getClanTag(labelData.clanTag)}${labelData.uid}`;
    }

    getColor = labelData => {
        return labelData.teamRelation.name === 'ENEMY' || labelData.teamRelation.name !== 'ALLY' ? 
            'color: #FF7C7C;' : 'color: #50B6FF;';
    }

    process = (chat, action) => {
        if (this.#initialized)
            return;
            
        if (!chat || !action)
            return utils.debug(__filename, 30, 'ConsoleLog::process', `chat (expected BattleChatComponent, type ${typeof chat}) or action (expected TankActionLogComponent, type: ${typeof action}) invalid`);

        this.#initialized = true;

        !chat.userCopy && (chat.userCopy = chat.onUserMessage_0);
        !chat.teamCopy && (chat.teamCopy = chat.onTeamMessage_0);

        !action.killed && (action.killed = action.onTankKilled_0);
        !action.suicide && (action.suicide = action.onTankSuicide_0);
        !action.join && (action.join = action.onUserJoinTheBattle_0);
        !action.leave && (action.leave = action.onUserLeaveTheBattle_0);

        chat.onUserMessage_0 = function (t) {
            console.log(`${utils.getTime()} - %c${consoleLog.getName(t.userLabelData)}:`,
                consoleLog.getColor(t.userLabelData), `${t.message}`);
            return this.userCopy(t);
        }

        chat.onTeamMessage_0 = function (t) {
            console.log(`${utils.getTime()} - %c${consoleLog.getName(t.userLabelData)}: ${t.message}`,
                'color: #50B6FF');
            return this.teamCopy(t);
        }

        action.onTankKilled_0 = function (t) {
            let killerName = consoleLog.getName(t.killerUserLabelData),
                destroyedName = consoleLog.getName(t.destroyedUserLabelData);

            console.log(`${utils.getTime()} - %c${killerName} %cdestroyed %c${destroyedName} %cwith an %c${t.damageType.name}`,
                consoleLog.getColor(t.killerUserLabelData), '',
                consoleLog.getColor(t.destroyedUserLabelData), '',
                'color: red;');

            return this.killed(t);
        }

        action.onTankSuicide_0 = function (t) {
            console.log(`${utils.getTime()} - %c${consoleLog.getName(t.userLabelData)}`, 
                consoleLog.getColor(t.userLabelData), 'suicide');
            return this.suicide(t);
        }

        action.onUserJoinTheBattle_0 = function (t) {
            console.log(`${utils.getTime()} - %c${consoleLog.getName(t.userLabelData)}`, 
                consoleLog.getColor(t.userLabelData), 'join');
            return this.join(t);
        }

        action.onUserLeaveTheBattle_0 = function (t) {
            console.log(`${utils.getTime()} - %c${consoleLog.getName(t.userLabelData)}`, 
                consoleLog.getColor(t.userLabelData), 'leave');
            return this.leave(t);
        }
    }
}