/**
 * 工作流引擎 - 配置模組
 * @module workflow-engine/config
 */

const WorkflowConfig = {
    nodeExecutionDelay: 4000,
    particleCount: 25,
    animationSpeed: 1
};

// 暴露到全域
window.WorkflowConfig = WorkflowConfig;
