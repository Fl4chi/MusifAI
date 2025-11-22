import chalk from 'chalk';
import moment from 'moment';

class Logger {
    get timestamp() {
        return `[${moment().format('YYYY-MM-DD HH:mm:ss')}]`;
    }

    log(message) {
        console.log(`${chalk.gray(this.timestamp)} ${chalk.blue('INFO')}    ${message}`);
    }

    success(message) {
        console.log(`${chalk.gray(this.timestamp)} ${chalk.green('SUCCESS')} ${message}`);
    }

    warn(message) {
        console.log(`${chalk.gray(this.timestamp)} ${chalk.yellow('WARN')}    ${message}`);
    }

    error(message, error = '') {
        console.error(`${chalk.gray(this.timestamp)} ${chalk.red('ERROR')}   ${message}`, error ? `\n${chalk.red(error)}` : '');
    }

    cmd(command, user, guild) {
        console.log(`${chalk.gray(this.timestamp)} ${chalk.magenta('CMD')}     /${command} used by ${chalk.cyan(user)} in ${chalk.cyan(guild)}`);
    }

    player(guildId, message) {
        console.log(`${chalk.gray(this.timestamp)} ${chalk.magenta('PLAYER')}  [${guildId}] ${message}`);
    }
}

export default new Logger();
