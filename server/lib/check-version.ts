/**
 * @file check-version.ts
 * @des 检查项目的node、npm版本号是否符合 package.json中的声明
 */
import chalk from 'chalk';
import semver from 'semver';
import packageConfig from '../../package.json';
import shell from 'shelljs';

function exec(cmd: string) {
    return require('child_process')
        .execSync(cmd)
        .toString()
        .trim();
}

// node版本号检查
const versionRequirements = [
    {
        name: 'node',
        currentVersion: semver.clean(process.version),
        versionRequirement: (packageConfig as any).engines.node,
    },
];

// 如果shell中运行的是npm，执行 npm版本号检查
if (shell.which('npm')) {
    versionRequirements.push({
        name: 'npm',
        currentVersion: exec('npm --version'),
        versionRequirement: (packageConfig as any).engines.npm,
    });
}

export default () => {
    const warnings = [];

    // 执行检查
    for (const mod of versionRequirements) {
        if (!mod.currentVersion) {
            continue;
        }
        // 如果不符合版本号的检查，则输出warning
        if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
            warnings.push(
                [
                    `${mod.name}: `,
                    chalk.red(mod.currentVersion),
                    ' should be ',
                    chalk.green(mod.versionRequirement),
                ].join(''),
            );
        }
    }

    if (warnings.length) {
        /* eslint-disable no-console */
        console.log('');
        console.log(chalk.yellow('To use this template, you must update following to modules:'));
        console.log('');
        for (const warning of warnings) {
            /* eslint-disable no-console */
            console.log('  ' + warning);
        }
        console.log();
        /* eslint-disable no-process-exit */
        process.exit(1);
    }
};
