/**
 * 工作流引擎 - 主入口模組
 * @module workflow-engine/index
 * @depends config.js, icons.js, previews.js, engine.js
 */

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof SERVICE_CONFIG !== 'undefined') {
        window.workflowEngine = new WorkflowEngine(SERVICE_CONFIG);
        console.log('📍[WorkflowEngine] 初始化完成');
    }
});

console.log('📍[WorkflowEngine] 模組載入完成');
