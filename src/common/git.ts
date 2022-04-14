/**
 * @description git简短输出的字符含义
 */
const SymbolMeaningMap: {[k: string]: string} = {
    ' ': '文件未修改',
    M: '文件已修改(modified)',
    T: '文件类型改变(type changed)',
    A: '新增的(added)',
    D: '已删除(deleted)',
    R: '重命名(renamed)',
    C: '复制(copied)',
    U: '更新但未合并(unmerged)',
    '?': '文件未追踪(untracked)',
    '!': '文件被忽略(ignored)',
}

export {
    SymbolMeaningMap
}