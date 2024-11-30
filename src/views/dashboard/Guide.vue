<template>
  <div className="user-guide">
    <h1>技术验证一体化服务平台用户指南</h1>
    <p>为了验证及展示所开发跨境支付异常识别技术服务中台的有效性和可行性，将参考银联商务鹰眼监测APP，通过该技术中台，封装、发布、测试、集成反洗钱识别关键技术服务，实现实时、安全、精准的违规监测及报告生成。</p>

    <div className="feature-section">
      <h2>1. AI技术微服务定义与发布</h2>
      <p>
        提交AI算法模型，基于技术服务接口规范定义技术微服务，结合算法模型微服务可视化支撑工具，选择、测试并发布AI技术微服务。</p>
    </div>

    <div className="feature-section">
      <h2>2. AI技术元应用仿真与构建</h2>
      <p>
        基于RAG增强大模型智能体以及可视化服务编排，实现人智协同的AI技术高效组合仿真，并且基于元应用模板自动形成元应用智能体原型，在此基础上进行定制与完善。</p>
    </div>

    <div className="feature-section">
      <h2>3. AI技术服务与元应用检索</h2>
      <p>
        在区块链的AI技术与应用存证溯源服务基础上，根据业务场景、应用需求、技术性质，以及AI技术服务与元应用全周期状态，进行高效检索与精准匹配。</p>
    </div>

    <div className="feature-section">
      <h2>4. 基于智能体的检索与集成</h2>
      <p>
        通过基于RAG增强的大模型智能体，实现AI技术元应用智能体的自动检索、评估与集成，达到智能高效的监测系统的动态构建与技术集成的智能化。</p>
    </div>

    <div className="feature-section">
      <h2>5. AI技术测试与元应用评估</h2>
      <p>
        执行面向真实应用场景的单个技术测评与元应用智能体应用验证，实现单个算法技术评测与应用验证相结合的综合评估，达到AI技术选择的深度匹配。</p>
    </div>

    <p>目前本平台还在开发中，其中的内容作为原型测试内容，目前仅作概念演示。</p>
  </div>
</template>

<script>
export default {
  name: 'Guide'
}
</script>

<style scoped>
.user-guide {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

h2 {
  font-size: 1.8em;
  margin-top: 30px;
  margin-bottom: 15px;
  color: #4a90e2;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 5px;
}

p {
  font-size: 1.1em;
  line-height: 1.6;
  color: #555;
}

.feature-section {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feature-section:last-child {
  margin-bottom: 0;
}
</style>
