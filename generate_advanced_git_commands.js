const fs = require('fs');
const path = require('path');

// Имя файла, в который будут записаны команды
const OUTPUT_FILENAME = 'git_commit_commands.sh';

// =================================================================
// 1. Конфигурация коммитов и группировки
// =================================================================

const EXTENSION_GROUPS = {
    "style(assets): add all public images and icons": [
        ".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp", ".ico"
    ],
    "docs(content): add documentation and content files": [
        ".md", ".mdx", ".txt", ".json"
    ],
    "chore(config): setup core project configuration": [
        ".mjs", ".config.ts" // Более специфично для конфигов
    ],
    "style(globals): add global styles and manifest": [
        ".css", ".webmanifest"
    ],
    "chore: update package lock files": [
        ".lock", ".yaml"
    ]
};

const CODE_COMMIT_PREFIX = "feat(module): implement logic in ";

const IGNORED_DIRS = new Set([
    'src/components/ui', 
    'src/components/icons', 
    'src/components/chartjs', 
    'src/constants', 
    'src/lib',
    'src/models',
    'src/utils', 
    'src/app', 
    'src/app/api',
    // Добавление других общих корней, которые не должны быть коммитами
    'src' 
]);

// =================================================================
// 2. Упрощенная и надежная логика парсинга
// =================================================================

/**
 * Извлекает только пути к файлам из вывода ls -R, игнорируя директории.
 * @param {string} lsROutput - Полный вывод команды ls -R.
 * @returns {object[]} Массив деталей файлов.
 */
function parseLsROutput(lsROutput) {
    const lines = lsROutput.split('\n').map(line => line.trim()).filter(Boolean);
    const allFileDetails = [];
    const allFiles = new Set();
    let currentDir = "";

    for (const line of lines) {
        // 1. Определяем, является ли строка заголовком директории
        if (line.endsWith(':')) {
            // Очищаем и нормализуем название директории
            currentDir = line
                .replace(/(\.:|\.\/)/, '')
                .replace(/:$/, '')
                .replace(/^'|'$/g, '') // Убираем кавычки, если они есть
                .trim();
            
            if (currentDir === '.') {
                currentDir = "";
            }
            continue;
        }

        // 2. Игнорируем стандартные элементы
        if (line === '.' || line === '..') {
            continue;
        }

        // 3. Обрабатываем элемент как файл
        
        const itemName = line.split(/\s+/)[0];
        let fullPath = "";

        if (currentDir) {
            // Файл внутри директории
            fullPath = path.join(currentDir, itemName).replace(/\\/g, '/');
        } else {
            // Файл в корневой директории
            fullPath = itemName.replace(/\\/g, '/');
        }

        // 4. Фильтрация и добавление
        
        // Игнорируем известные папки в корне или общие игнорируемые файлы
        if (['public', 'src', 'components.json', 'pnpm-lock.yaml'].includes(fullPath) || fullPath.endsWith('/')) {
            continue;
        }

        if (!allFiles.has(fullPath)) {
            allFiles.add(fullPath);
            
            let ext = path.extname(fullPath).toLowerCase();
            
            // Логика определения расширений для Next.js файлов без явного расширения (e.g., [id] в пути)
            if (ext === '') {
                if (fullPath.includes('.tsx') || fullPath.includes('.jsx')) {
                    ext = path.extname(fullPath.substring(0, fullPath.indexOf('.'))).toLowerCase(); // Например, для [id].tsx
                } else if (fullPath.endsWith('manifest') || fullPath.endsWith('webmanifest')) {
                    ext = '.webmanifest';
                } else if (fullPath.includes('layout') || fullPath.includes('page') || fullPath.includes('route')) {
                     ext = '.tsx'; // Предполагаем, что это кодовый файл Next.js
                } else if (fullPath.includes('middleware')) {
                    ext = '.ts';
                }
            }

            allFileDetails.push({
                path: fullPath,
                ext: ext || path.extname(fullPath).toLowerCase(), // Защита от пустых расширений
                dir: path.dirname(fullPath).replace(/\\/g, '/')
            });
        }
    }
    return allFileDetails.sort((a, b) => a.path.localeCompare(b.path));
}


// =================================================================
// 3. Логика группировки и генерации команд
// =================================================================

function generateCommands(fileDetails) {
    const commands = [];
    const processedFiles = new Set();

    // 1. Группировка файлов по расширению (не-кодовые)
    const extCommitGroups = {};
    for (const [commitTitle, extensions] of Object.entries(EXTENSION_GROUPS)) {
        extCommitGroups[commitTitle] = fileDetails.filter(f => {
            const isCodeFile = f.ext === '.ts' || f.ext === '.js' || f.ext === '.tsx' || f.ext === '.jsx';
            return extensions.includes(f.ext) && !isCodeFile && !processedFiles.has(f.path);
        });
        extCommitGroups[commitTitle].forEach(f => processedFiles.add(f.path));
    }
    
    // 2. Группировка файлов по папкам (кодовые файлы: .ts, .js, .tsx, .jsx)
    const codeFiles = fileDetails.filter(f => 
        (f.ext === '.ts' || f.ext === '.js' || f.ext === '.tsx' || f.ext === '.jsx') && 
        !processedFiles.has(f.path)
    );
    
    const dirCommitGroups = {};
    codeFiles.forEach(f => {
        const dir = f.dir;
        
        // Файлы в игнорируемых папках или в корне ('.') будут обработаны в финальном коммите
        if (IGNORED_DIRS.has(dir) || dir === '.') {
            return;
        }

        const folderName = dir.split('/').filter(Boolean).pop(); 
        const commitTitle = `${CODE_COMMIT_PREFIX}${folderName}`;
        
        if (!dirCommitGroups[commitTitle]) {
            dirCommitGroups[commitTitle] = [];
        }
        dirCommitGroups[commitTitle].push(f);
        processedFiles.add(f.path);
    });

    // 3. Генерация команд в логическом порядке
    
    commands.push(
        "#!/bin/bash",
        "# ----------------------------------------------------------------",
        `# Этот скрипт сгенерирован для восстановления истории Git-коммитов.`,
        `# Он содержит все команды 'git add' и 'git commit' для вашего проекта.`,
        "# ----------------------------------------------------------------",
        `# Запуск: git init && sh ./${OUTPUT_FILENAME}`,
        ""
    );
    
    // A. Коммиты по расширениям (не-кодовые файлы)
    for (const [title, files] of Object.entries(extCommitGroups)) {
        if (files.length > 0) {
            const addCommand = "git add " + files.map(f => `'${f.path.replace(/'/g, "'\\''")}'`).join(" ");
            commands.push(addCommand);
            commands.push(`git commit -m "${title.replace(/"/g, '\\"')}"`);
            commands.push("");
        }
    }
    
    // B. Коммиты по папкам (кодовые файлы)
    for (const [title, files] of Object.entries(dirCommitGroups)) {
        if (files.length > 0) {
            const addCommand = "git add " + files.map(f => `'${f.path.replace(/'/g, "'\\''")}'`).join(" ");
            commands.push(addCommand);
            commands.push(`git commit -m "${title.replace(/"/g, '\\"')}"`);
            commands.push("");
        }
    }

    // C. Финальный коммит для оставшихся файлов (корневые файлы, утилиты, игнорируемые папки)
    const remainingFiles = fileDetails.filter(f => !processedFiles.has(f.path));

    if (remainingFiles.length > 0) {
        const addCommand = "git add " + remainingFiles.map(f => `'${f.path.replace(/'/g, "'\\''")}'`).join(" ");
        commands.push(addCommand);
        commands.push(`git commit -m "chore(cleanup): finalize root configs and utility files"`);
        commands.push("");
    }
    
    return commands.join('\n');
}

// =================================================================
// 4. Выполнение (Запись в файл)
// =================================================================

function main() {
    try {
        const lsROutput = fs.readFileSync(0, 'utf8');

        // 1. Извлекаем список файлов
        const fileDetails = parseLsROutput(lsROutput);
        
        if (fileDetails.length === 0) {
            console.error("❌ Критическая ошибка: Не удалось найти ни одного файла для обработки. Проверьте ваш вывод 'ls -R'.");
            process.exit(1);
        }

        // 2. Генерируем команды
        const finalCommands = generateCommands(fileDetails);
        
        // 3. Записываем команды в файл
        fs.writeFileSync(OUTPUT_FILENAME, finalCommands, 'utf8');

        // 4. Выводим сообщение об успехе
        console.log(`✅ Успешно! Команды Git (${fileDetails.length} файлов) записаны в файл: \x1b[33m${OUTPUT_FILENAME}\x1b[0m`);
        console.log(`\nДля выполнения команд:`);
        console.log(`1. Убедитесь, что вы находитесь в корне проекта с файлами.`);
        console.log(`2. Запустите: \x1b[32mgit init\x1b[0m`);
        console.log(`3. Затем: \x1b[32msh ./${OUTPUT_FILENAME}\x1b[0m`);
        
    } catch (error) {
        if (error.code === 'EINVAL') {
             console.error("\n❌ Ошибка: Входные данные не получены. Убедитесь, что вы запускаете скрипт через pipe:");
             console.error(`\x1b[36mcat ls_output.txt | node generate_advanced_git_commands_v2.js\x1b[0m`);
        } else {
             console.error(`\n❌ Критическая ошибка: ${error.message}`);
        }
        process.exit(1);
    }
}

main();